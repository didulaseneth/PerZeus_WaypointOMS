import { Mail, Bell, AlertTriangle, Info } from "lucide-react";
import Clock from "./Clock";
import { getThemeClasses, getTimeOfDay } from "../../utils/time";

/**
 * Inbox / Messages screen for Driver.
 */
const InboxScreen = ({
  messages = [
    {
      id: 1,
      type: "alert",
      title: "Route Update",
      body: "Stop #4 has been rescheduled to 11:30 AM due to traffic.",
      time: "08:12 AM",
      unread: true,
    },
    {
      id: 2,
      type: "info",
      title: "Dispatcher Note",
      body: "Please confirm POD for Green Mart before leaving the premises.",
      time: "07:45 AM",
      unread: true,
    },
    {
      id: 3,
      type: "system",
      title: "Shift Reminder",
      body: "Your shift ends at 6:00 PM. Complete remaining stops by 5:30 PM.",
      time: "Yesterday",
      unread: false,
    },
  ],
  timeOfDay,
  isNight,
}) => {
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);

  const typeIcon = {
    alert: AlertTriangle,
    info: Info,
    system: Bell,
  };

  return (
    <div className={`flex flex-col min-h-full ${theme.pageBg} pb-24`}>
      <div className={`${theme.headerBg} px-5 pt-6 pb-4 flex items-center justify-between`}>
        <h3 className="text-whiteCustom text-heading">Inbox</h3>
        <Clock className="text-neutral3" showIcon />
      </div>

      <div className="px-4 pt-4 space-y-2.5">
        {messages.length === 0 ? (
          <div className={`text-center py-16 ${theme.textMuted}`}>
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-paragraph">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => {
            const Icon = typeIcon[msg.type] || Bell;
            return (
              <div
                key={msg.id}
                className={`p-4 rounded-2xl border ${theme.border} ${
                  msg.unread ? theme.cardBg : theme.cardBgAlt
                } ${msg.unread ? "shadow-sm" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      msg.type === "alert"
                        ? "bg-secondaryYellow/40"
                        : "bg-neutral1"
                    }`}
                  >
                    <Icon
                      className={`w-4.5 h-4.5 ${
                        msg.type === "alert" ? "text-blackCustom" : "text-purplePrimary"
                      }`}
                      strokeWidth={2}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-paragraph ${theme.textPrimary}`}>{msg.title}</h4>
                      {msg.unread && (
                        <span className="w-2 h-2 rounded-full bg-purplePrimary shrink-0" />
                      )}
                    </div>
                    <p className={`text-secondaryText ${theme.textMuted} mt-0.5`}>{msg.body}</p>
                    <p className={`text-smallText ${theme.textMuted} mt-1.5`}>{msg.time}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InboxScreen;
