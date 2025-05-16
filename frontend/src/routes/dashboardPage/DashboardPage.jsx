import { useMutation, useQueryClient } from "@tanstack/react-query";
import "./dashboardPage.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [token, setToken] = useState(null);

  // Fetch token on component mount
  useEffect(() => {
    async function fetchToken() {
      const t = await getToken();
      setToken(t);
    }
    fetchToken();
  }, [getToken]);

  const mutation = useMutation({
    mutationFn: (text) => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      }).then((res) => res.json());
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      navigate(`/dashboard/chats/${id}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text || !token) return; // wait for token to be loaded
    mutation.mutate(text);
  };

  return (
    <div className="dashboardPage">
      {/* your JSX here */}
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <input type="text" name="text" placeholder="Ask me anything..." />
          <button>
            <img src="/arrow.png" alt="" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;

