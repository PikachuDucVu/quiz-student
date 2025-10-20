import { useCallback, useRef, useState } from "react";
import { LuBrain } from "react-icons/lu";

const BASE_URL_API = "http://localhost:3000";

function App() {
  const [isReady, setIsReady] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<
    { question: string; options: string[]; answer: string }[]
  >([]);
  const answersRef = useRef<string[]>([]);

  const fetchQuestions = useCallback(async () => {
    const res = await fetch(`${BASE_URL_API}/getQuestionnaires`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = (await res.json()) as {
      questionnaires: {
        question: string;
        options: string[];
        answer: string;
      }[];
    };
    setQuestions(data.questionnaires);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (currentAnswer === "") return;

    // if (currentAnswer === questions[currentQuestionIndex].answer) {
    //   setScore((prev) => prev + 1);
    // }

    setCurrentAnswer("");
    setCurrentQuestionIndex((prev) => prev + 1);
    answersRef.current.push(currentAnswer);

    if (currentQuestionIndex === questions.length - 1) {
      // alert(`Quiz kết thúc! Điểm của bạn: ${score + 1}/${questions.length}`);
      // setCurrentQuestionIndex(0);
      // setScore(0);
      console.log(answersRef.current);
      // Call API gửi answersRef.current lên server

      // ========== SERVER ==========
      // Viết API nộp bài quiz, path: POST:/submit-quiz
      // body { answers: string[] }
      // Kiểm tra đáp án có đúng với câu trả lời trong mảng questionnaires hay không
      // Trả về { success: true, score: number, totalQuestions: number }

      if (answersRef.current.length !== questions.length) {
        alert("Đã có lỗi xảy ra. Vui lòng thử lại!");
        return;
      }

      const res = await fetch(`${BASE_URL_API}/submit-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers: answersRef.current }),
      });
      const data = (await res.json()) as {
        success: boolean;
        score: number;
        totalQuestions: number;
        message?: string;
      };

      if (data.success) {
        alert(
          `Quiz kết thúc! Điểm của bạn: ${data.score}/${data.totalQuestions}`
        );
      } else {
        if (data.message) {
          alert(data.message);
        } else {
          alert("Đã có lỗi xảy ra. Vui lòng thử lại!");
        }
      }
    }
  }, [currentAnswer, currentQuestionIndex, questions]);

  const handleStartQuiz = useCallback(() => {
    fetchQuestions();
    setIsReady(true);
  }, [fetchQuestions]);

  if (!isReady) {
    return (
      <div className="bg-green-500 min-h-[300px] w-[300px] p-3 space-y-3 flex items-center justify-center">
        <button
          className="text-white bg-blue-500 px-4 py-2 rounded-full font-semibold"
          onClick={handleStartQuiz}
        >
          Bắt đầu Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="bg-green-500 min-h-[300px] w-[300px] p-3 space-y-3">
      <div className="flex w-full justify-between items-center">
        <div className="text-xs bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white px-2 py-1 rounded-full flex items-center gap-0.5 font-medium">
          <LuBrain className="translate-y-0.25" />
          Quiz thông minh
        </div>
        <div className="text-xs font-semibold border px-2 py-1 rounded-xl bg-white/70">
          Câu 1/5
        </div>
      </div>

      <div className="h-1.5 w-full bg-amber-500 rounded-full" />
      <div className="font-bold text-lg">
        {questions[currentQuestionIndex]?.question || "Đang tải..."}
      </div>
      <div className="flex flex-col gap-1">
        {questions[currentQuestionIndex]?.options.map((option, index) => (
          <div
            className={[
              "flex gap-3 items-center w-full border rounded-xl px-3 py-1.5 text-sm font-medium hover:bg-amber-500",
              currentAnswer === option ? "bg-blue-500" : "bg-gray-200",
            ].join(" ")}
            key={index}
            onClick={() => setCurrentAnswer(option)}
          >
            {option}
          </div>
        ))}
      </div>

      <div className="flex w-full justify-between items-center">
        <div className="text-xs">
          Điểm: {score}/{questions.length}
        </div>
        <div
          className="text-xs bg-gradient-to-r from-[#ff6b9d] to-[#f8b500] text-white font-bold px-3 py-1 rounded-full cursor-pointer"
          onClick={handleSubmit}
        >
          Câu tiếp theo
        </div>
      </div>
    </div>
  );
}

export default App;
