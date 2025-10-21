import { Link } from "react-router-dom";
import "./chatList.css";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
const ChatList = () => {
  const { getToken } = useAuth();
  const { isLoading, error, data } = useQuery({
    queryKey: ["userChats"],
    queryFn: async () =>
      const token = await getToken();
      fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
         headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json()),
  });

  const chats = data?.[0]?.chats || [];

// Sort by createdAt descending (newest first)
  const sortedChats = chats
  .slice() // create a shallow copy so you don't mutate original data
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

// Get top 10
   const top10Chats = sortedChats.slice(0, 10);


  return (
    <div className="chatList">
      <span className="title">DASHBOARD</span>
      <Link to="/dashboard">Create a new Chat</Link>
      <Link to="/">Explore QueryNest</Link>
      <Link to="/">Contact</Link>
      <hr />
      <span className="title">RECENT CHATS</span>
      <div className="list">
           {isLoading
      ? "Loading..."
      : error
      ? "Something went wrong!"
      : top10Chats.length > 0
      ? top10Chats.map(chat => (
          <Link to={`/dashboard/chats/${chat._id}`} key={chat._id}>
            {chat.title}
          </Link>
        ))
      : "No chats found."
    }
       </div>
      <hr />
      <div className="upgrade">
        <img src="/logo.png" alt="" />
      </div>
    </div>
  );
};


export default ChatList;
