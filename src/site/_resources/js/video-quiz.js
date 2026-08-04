(() => {
  "use strict";
  const track = (name, params) => {
    if (typeof window.gtag === "function") window.gtag("event", name, params);
  };
  document.querySelectorAll("[data-video-quiz]").forEach((quiz) => {
    const slug = quiz.dataset.videoQuiz;
    const blocks = Array.from(quiz.querySelectorAll("[data-quiz-block]"));
    const scoreLine = quiz.querySelector("[data-quiz-score]");
    const answered = new Set();
    const missed = new Set();
    let firstTryCorrect = 0;
    blocks.forEach((block) => {
      const result = block.querySelector("[data-quiz-result]");
      const explanation = block.querySelector("[data-quiz-explanation]");
      block.querySelectorAll(".video-quiz-option").forEach((option) => {
        option.addEventListener("click", () => {
          const questionIndex = option.dataset.quizQuestion;
          if (answered.has(questionIndex)) return;
          const correct = option.dataset.quizCorrect === "true";
          track("video_quiz_answer", { video_slug: slug, question: Number(questionIndex), correct });
          if (correct) {
            answered.add(questionIndex);
            if (!missed.has(questionIndex)) firstTryCorrect += 1;
            option.classList.add("is-correct");
            result.textContent = "Correct.";
            result.className = "video-quiz-result is-correct";
            if (explanation) explanation.hidden = false;
            block.querySelectorAll(".video-quiz-option").forEach((other) => {
              other.disabled = true;
              if (other !== option) other.classList.add("is-muted");
            });
            if (answered.size === blocks.length && scoreLine) {
              scoreLine.textContent = `Knowledge check complete: ${firstTryCorrect} of ${blocks.length} correct on the first try.`;
              scoreLine.hidden = false;
              track("video_quiz_complete", { video_slug: slug, questions: blocks.length });
            }
          } else {
            missed.add(questionIndex);
            option.classList.add("is-incorrect");
            option.disabled = true;
            result.textContent = "Not quite. Try another answer.";
            result.className = "video-quiz-result is-incorrect";
          }
        });
      });
    });
  });
})();
