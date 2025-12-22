# 🏋️‍♂️ AI Fitness Trainer

AI Fitness Trainer is a real-time, AI-powered fitness coaching web application that uses computer vision to analyze exercise form, automatically count repetitions, and provide instant voice feedback—just like having a personal trainer watching you live. The platform works using only a device camera, with no wearables required, and helps users track goals and monitor progress over time.

🌐 **Live Demo:** https://ai-fitness-trainer-beta.vercel.app/  
📂 **GitHub Repo:** https://github.com/Abishakm1507/ai-fitness-trainer

---

## 🚀 Features

- 🎥 Real-time exercise tracking using a camera  
- 🤖 AI-based posture and form analysis  
- 🔢 Automatic repetition counting  
- 🗣️ Live voice feedback for form correction  
- ⏱️ Workout duration tracking  
- 🎯 Goal setting (weekly targets & streaks)  
- 📊 Workout history and progress visualization  
- 🔐 Secure authentication and user data storage  

---

## 🧠 How It Works

The application uses **TensorFlow’s MoveNet pose-detection model** to detect key body joints from the live camera feed. Each frame produces 17 body keypoints:

\[
P = \{(x_i, y_i)\}_{i=1}^{17}
\]

These keypoints are analyzed over time to:
- Detect exercise movements
- Count repetitions
- Evaluate posture and alignment
- Trigger voice feedback when form deviates

To improve stability, temporal smoothing is applied to reduce noise in real-time pose detection.

---

## 🛠️ Built With

- **Languages:** TypeScript, JavaScript  
- **Frontend:** React, Vite  
- **UI & Styling:** Tailwind CSS, shadcn-ui  
- **Backend & Database:** Supabase  
- **AI / ML:** TensorFlow.js, MoveNet pose-detection model  
- **APIs:** Web Camera API, Web Speech API  
- **Deployment:** Vercel  

---

## 📦 Installation & Setup

Follow these steps to run the project locally:

```bash
# Clone the repository
git clone https://github.com/Abishakm1507/ai-fitness-trainer

# Navigate to the project directory
cd ai-fitness-trainer

# Install dependencies
npm install

# Start the development server
npm run dev
