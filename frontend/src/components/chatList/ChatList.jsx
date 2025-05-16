import { Link } from "react-router-dom";
import "./chatList.css";
import { useQuery } from "@tanstack/react-query";

const ChatList = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["userChats"],
    queryFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/userChats`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      } catch (err) {
        console.error("Fetch user chats failed:", err);
        throw err;
      }
    },
  });

  if (error) {
    console.error("useQuery error:", error);
  }
   
  return (
    <div className="chatList">
      <span className="title">DASHBOARD</span>
      <Link to="/dashboard">Create a new Chat</Link>
      <Link to="/">Explore CanBot</Link>
      <Link to="/">Contact</Link>
      <hr />
      {/* <span className="title">RECENT CHATS</span> */}
      <div className="list">
        {isLoading
          ? ""
          : error
          ? ""
          : data?.map((chat) => (
              <Link to={`/dashboard/chats/${chat._id}`} key={chat._id}>
                {chat.title}
              </Link>
            ))}
      </div>
      <hr />
      <div className="upgrade">
        <img src="/logo.png" alt="" />
        <div className="texts">
          <span>Upgrade to Lama AI Pro</span>
          <span>Get unlimited access to all features</span>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
