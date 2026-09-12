//+------------------------------------------------------------------+
//|                                             ApexJournalSync.mq4   |
//|                        Copyright 2026, ApexJournal SaaS Platform |
//|        https://github.com/benisson-beep/ApexJournal-forexjournal |
//+------------------------------------------------------------------+
#property copyright "ApexJournal"
#property link      "https://github.com/benisson-beep/ApexJournal-forexjournal"
#property version   "1.00"
#property description "Automated Real-Time Trade Synchronizer for MT4"
#property strict

//--- Inputs
input string InpApiKey      = "aj_live_demo123";                      // ApexJournal API Key
input string InpWebhookUrl  = "http://localhost:3000/api/sync/trade"; // Webhook URL
input string InpAccountId   = "acc-ftmo-1";                          // Account ID
input int    InpPollIntervalSec = 3;                                 // Scan Frequency (Seconds)

//--- Tracking
datetime LastProcessedCloseTime = 0;
int LastClosedCount = 0;

//+------------------------------------------------------------------+
//| OnInit                                                           |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("[ApexJournal MT4] EA Initialized.");
   LastProcessedCloseTime = TimeCurrent() - 86400; // Check last 24h
   EventSetTimer(InpPollIntervalSec);
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| OnDeinit                                                         |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
}

//+------------------------------------------------------------------+
//| OnTimer                                                          |
//+------------------------------------------------------------------+
void OnTimer()
{
   int history_total = OrdersHistoryTotal();
   if(history_total == LastClosedCount) return;

   for(int i = history_total - 1; i >= 0; i--)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
      {
         datetime close_time = OrderCloseTime();
         if(close_time <= LastProcessedCloseTime) break;

         int type = OrderType();
         if(type == OP_BUY || type == OP_SELL)
         {
            SendOrderToApexJournal();
         }
      }
   }

   LastClosedCount = history_total;
   LastProcessedCloseTime = TimeCurrent();
}

//+------------------------------------------------------------------+
//| Send current selected order to ApexJournal                       |
//+------------------------------------------------------------------+
bool SendOrderToApexJournal()
{
   string json = "{";
   json += "\"ticket\":\"" + IntegerToString(OrderTicket()) + "\",";
   json += "\"account_id\":\"" + InpAccountId + "\",";
   json += "\"symbol\":\"" + OrderSymbol() + "\",";
   json += "\"type\":\"" + (OrderType() == OP_BUY ? "BUY" : "SELL") + "\",";
   json += "\"lots\":" + DoubleToString(OrderLots(), 2) + ",";
   json += "\"open_price\":" + DoubleToString(OrderOpenPrice(), Digits) + ",";
   json += "\"close_price\":" + DoubleToString(OrderClosePrice(), Digits) + ",";
   json += "\"sl\":" + DoubleToString(OrderStopLoss(), Digits) + ",";
   json += "\"tp\":" + DoubleToString(OrderTakeProfit(), Digits) + ",";
   json += "\"commission\":" + DoubleToString(OrderCommission(), 2) + ",";
   json += "\"swap\":" + DoubleToString(OrderSwap(), 2) + ",";
   json += "\"profit\":" + DoubleToString(OrderProfit(), 2) + ",";
   json += "\"open_time\":\"" + TimeToString(OrderOpenTime(), TIME_DATE|TIME_SECONDS) + "\",";
   json += "\"close_time\":\"" + TimeToString(OrderCloseTime(), TIME_DATE|TIME_SECONDS) + "\",";
   json += "\"comment\":\"" + OrderComment() + "\"";
   json += "}";

   char post_data[];
   char result[];
   string result_headers;
   StringToCharArray(json, post_data, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(post_data, ArraySize(post_data) - 1);

   string headers = "Content-Type: application/json\r\nx-api-key: " + InpApiKey + "\r\n";

   ResetLastError();
   int res = WebRequest("POST", InpWebhookUrl, headers, 5000, post_data, result, result_headers);

   return (res == 200 || res == 201);
}
