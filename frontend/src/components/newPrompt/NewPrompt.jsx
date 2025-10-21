import { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

const NewPrompt = ({ data }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });

  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const chat = model.startChat({
    history:
      data?.history?.map(({ role, parts }) => ({
        role,
        parts: [{ text: parts[0]?.text }],
      })) || [],
    generationConfig: {},
  });

  const endRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data, question, answer, img.dbData]);

  // ✅ FIXED: Send correct keys ("question" and "answer")
  const mutation = useMutation({
    mutationFn: async ({ question, answer }) => {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          answer,
          img: img.dbData?.filePath || undefined,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to update chat");
      }

      return res.json().catch(() => null); // Handle empty JSON
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", data._id] });
      formRef.current?.reset();
      setQuestion("");
      setAnswer("");
      setImg({ isLoading: false, error: "", dbData: {}, aiData: {} });
    },
    onError: (err) => console.error("Mutation error:", err.message),
  });

  const add = async (text, isInitial = false) => {
    if (!isInitial) setQuestion(text);
    setAnswer("");

    try {
      const inputData = Object.entries(img.aiData).length ? [img.aiData, text] : [text];
      const result = await chat.sendMessageStream(inputData);

      let accumulatedText = "";
      for await (const chunk of result.stream) {
        accumulatedText += chunk.text();
        setAnswer(accumulatedText);
      }

      // ✅ FIXED: send correct variable names
      mutation.mutate({ question: text, answer: accumulatedText });
    } catch (err) {
      console.error("Chat error:", err);
      setAnswer("Error generating answer.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = e.target.text.value.trim();
    if (!text) return;
    add(text, false);
  };

  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current && data?.history?.length === 1) {
      add(data.history[0].parts[0].text, true);
      hasRun.current = true;
    }
  }, [data]);

  return (
    <>
      {img.isLoading && <div>Loading...</div>}
      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          path={img.dbData?.filePath}
          width="380"
          transformation={[{ width: 380 }]}
        />
      )}
      {question && <div className="message user">{question}</div>}
      {answer && (
        <div className="message">
          <Markdown>{answer}</Markdown>
        </div>
      )}
      <div className="endChat" ref={endRef}></div>
      <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
        <Upload setImg={setImg} />
        <input id="file" type="file" multiple={false} hidden />
        <input type="text" name="text" placeholder="Ask anything..." />
        <button type="submit">
          <img src="/arrow.png" alt="send" />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;
