import Sidebar from "./Sidebar";
import Header from "./Header";
import ChatBot from "./ChatBot";

export default function Layout({ title, children }) {
  return (
    <div className="flex min-h-screen bg-gray1">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
      <ChatBot />
    </div>
  );
}