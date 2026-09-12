//+------------------------------------------------------------------+
//|                                             ApexJournalSync.mq5   |
//|                        Copyright 2026, ApexJournal SaaS Platform |
//|        https://github.com/benisson-beep/ApexJournal-forexjournal |
//+------------------------------------------------------------------+
#property copyright "ApexJournal"
#property link      "https://github.com/benisson-beep/ApexJournal-forexjournal"
#property version   "1.00"
#property description "Automated Real-Time Trade Synchronizer for ApexJournal"
#property strict

//--- Input Parameters
input group "=== ApexJournal Connection Settings ==="
input string   InpApiKey      = "aj_live_demo123";          // Your ApexJournal API Key
input string   InpWebhookUrl  = "http://localhost:3000/api/sync/trade"; // Webhook URL (replace with production domain)
input string   InpAccountId   = "acc-ftmo-1";              // Account Identifier in ApexJournal
input bool     InpSyncHistoryOnStart = true;               // Sync last 24h trades on EA start

//--- Global Variables
ulong LastProcessedDeal = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("[ApexJournal] EA Initialized. Checking WebRequest permissions...");
   
   if(InpApiKey == "" || InpWebhookUrl == "")
   {
      Alert("[ApexJournal] ERROR: Please enter your API Key and Webhook URL in EA Inputs!");
      return(INIT_PARAMETERS_INCORRECT);
   }

   // Scan recent deals if requested
   if(InpSyncHistoryOnStart)
   {
      SyncRecentDeals(86400); // last 24 hours
   }

   EventSetTimer(5); // 5-second periodic check as safety net
   Print("[ApexJournal] Real-time trade synchronization active.");
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   Print("[ApexJournal] EA stopped.");
}

//+------------------------------------------------------------------+
//| Timer function for fallback synchronization                      |
//+------------------------------------------------------------------+
void OnTimer()
{
   SyncRecentDeals(300); // Last 5 minutes check
}

//+------------------------------------------------------------------+
//| TradeTransaction function - Instant Real-Time Event Trigger      |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction& trans,
                        const MqlTradeRequest& request,
                        const MqlTradeResult& result)
{
   // Check if transaction represents a closed deal
   if(trans.type == TRADE_TRANSACTION_DEAL_ADD)
   {
      ulong deal_ticket = trans.deal;
      if(deal_ticket > 0 && HistoryDealSelect(deal_ticket))
      {
         long entry = HistoryDealGetInteger(deal_ticket, DEAL_ENTRY);
         // DEAL_ENTRY_OUT means position was closed
         if(entry == DEAL_ENTRY_OUT || entry == DEAL_ENTRY_INOUT || entry == DEAL_ENTRY_OUT_BY)
         {
            SendDealToApexJournal(deal_ticket);
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Send a single Deal to ApexJournal API via WebRequest             |
//+------------------------------------------------------------------+
bool SendDealToApexJournal(ulong deal_ticket)
{
   if(!HistoryDealSelect(deal_ticket)) return false;
   if(deal_ticket <= LastProcessedDeal) return true; // Already processed

   string symbol      = HistoryDealGetString(deal_ticket, DEAL_SYMBOL);
   long   deal_type   = HistoryDealGetInteger(deal_ticket, DEAL_TYPE);
   double volume      = HistoryDealGetDouble(deal_ticket, DEAL_VOLUME);
   double price       = HistoryDealGetDouble(deal_ticket, DEAL_PRICE);
   double commission  = HistoryDealGetDouble(deal_ticket, DEAL_COMMISSION);
   double swap        = HistoryDealGetDouble(deal_ticket, DEAL_SWAP);
   double profit      = HistoryDealGetDouble(deal_ticket, DEAL_PROFIT);
   datetime time      = (datetime)HistoryDealGetInteger(deal_ticket, DEAL_TIME);
   long position_id   = HistoryDealGetInteger(deal_ticket, DEAL_POSITION_ID);
   string comment     = HistoryDealGetString(deal_ticket, DEAL_COMMENT);

   // Only sync Buy and Sell deals
   if(deal_type != DEAL_TYPE_BUY && deal_type != DEAL_TYPE_SELL) return false;

   // Lookup position open price from historical orders
   double open_price = price; // default fallback
   datetime open_time = time - 3600;
   
   if(HistorySelectByPosition(position_id))
   {
      int deals_total = HistoryDealsTotal();
      for(int i = 0; i < deals_total; i++)
      {
         ulong d_ticket = HistoryDealGetTicket(i);
         if(d_ticket > 0 && HistoryDealGetInteger(d_ticket, DEAL_ENTRY) == DEAL_ENTRY_IN)
         {
            open_price = HistoryDealGetDouble(d_ticket, DEAL_PRICE);
            open_time  = (datetime)HistoryDealGetInteger(d_ticket, DEAL_TIME);
            break;
         }
      }
   }

   // Format ISO-8601 timestamps
   string s_close_time = TimeToString(time, TIME_DATE|TIME_SECONDS);
   string s_open_time  = TimeToString(open_time, TIME_DATE|TIME_SECONDS);

   // Construct JSON payload
   string json = "{";
   json += "\"ticket\":\"" + IntegerToString(deal_ticket) + "\",";
   json += "\"account_id\":\"" + InpAccountId + "\",";
   json += "\"symbol\":\"" + symbol + "\",";
   json += "\"type\":\"" + (deal_type == DEAL_TYPE_BUY ? "BUY" : "SELL") + "\",";
   json += "\"lots\":" + DoubleToString(volume, 2) + ",";
   json += "\"open_price\":" + DoubleToString(open_price, 5) + ",";
   json += "\"close_price\":" + DoubleToString(price, 5) + ",";
   json += "\"commission\":" + DoubleToString(commission, 2) + ",";
   json += "\"swap\":" + DoubleToString(swap, 2) + ",";
   json += "\"profit\":" + DoubleToString(profit, 2) + ",";
   json += "\"open_time\":\"" + s_open_time + "\",";
   json += "\"close_time\":\"" + s_close_time + "\",";
   json += "\"comment\":\"" + comment + "\"";
   json += "}";

   // Prepare HTTP POST WebRequest
   char post_data[];
   char result[];
   string result_headers;
   StringToCharArray(json, post_data, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(post_data, ArraySize(post_data) - 1); // remove null terminator

   string headers = "Content-Type: application/json\r\nx-api-key: " + InpApiKey + "\r\n";

   ResetLastError();
   int res = WebRequest("POST", InpWebhookUrl, headers, 5000, post_data, result, result_headers);

   if(res == 200 || res == 201)
   {
      Print("[ApexJournal] Deal #", deal_ticket, " synced successfully to journal!");
      LastProcessedDeal = deal_ticket;
      return true;
   }
   else
   {
      Print("[ApexJournal] Error sending deal #", deal_ticket, ". Code: ", res, ", Error: ", GetLastError());
      return false;
   }
}

//+------------------------------------------------------------------+
//| Scan and synchronize recent deals within past N seconds          |
//+------------------------------------------------------------------+
void SyncRecentDeals(int seconds_back)
{
   datetime from_time = TimeCurrent() - seconds_back;
   datetime to_time   = TimeCurrent();

   if(HistorySelect(from_time, to_time))
   {
      int deals_total = HistoryDealsTotal();
      for(int i = 0; i < deals_total; i++)
      {
         ulong deal_ticket = HistoryDealGetTicket(i);
         if(deal_ticket > 0 && deal_ticket > LastProcessedDeal)
         {
            long entry = HistoryDealGetInteger(deal_ticket, DEAL_ENTRY);
            if(entry == DEAL_ENTRY_OUT || entry == DEAL_ENTRY_INOUT)
            {
               SendDealToApexJournal(deal_ticket);
            }
         }
      }
   }
}
