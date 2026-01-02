# 📚 VocabForge - Spaced Repetition English Learning

<div align="center">

![VocabForge Banner](https://img.shields.io/badge/VocabForge-English%20Learning-f59e0b?style=for-the-badge&logo=bookstack&logoColor=white)

**A powerful vocabulary learning app using spaced repetition and YouTube video context**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[🚀 **Live Demo**](#) · [📖 How to Use](#-how-to-use) · [🎯 Features](#-features)

</div>

---

## 🖼️ Preview

<div align="center">

| Main Screen | Study Mode | Add Video |
|:-----------:|:----------:|:---------:|
| ![Main](https://via.placeholder.com/250x400/0a0a0f/f59e0b?text=Main+Screen) | ![Study](https://via.placeholder.com/250x400/0a0a0f/10b981?text=Study+Mode) | ![Video](https://via.placeholder.com/250x400/0a0a0f/3b82f6?text=Add+Video) |

</div>

---

## 🎯 Features

### 📖 Spaced Repetition System (Anki-Style)
- Scientific learning intervals: **12h → 1d → 2d → 3d → 5d → 7d → 15d**
- Words automatically deleted after mastering (15 days)
- If you forget, interval resets to beginning
- Track your progress with visual stages

### 🎬 YouTube Video Integration
- Add videos with manually pasted subtitles
- Search for words across all your videos
- Play **only the specific segment** containing your word
- See the sentence with your word highlighted
- Multiple examples per word with "Next Example" button

### 📱 Study Modes
- **Individual Study**: Click any word to study it manually
- **Start All**: Sequential study of all due words with auto-playing videos
- Filter words: All / Due / Learning

### 🌍 Features
- **Istanbul Timezone**: Perfect for Turkish learners
- **Mobile Responsive**: Works great on phones and tablets
- **Dark Theme**: Easy on the eyes
- **Offline Capable**: Works without internet after loading

---

## ⚠️ Important: Data Storage

> **🔒 All your data is stored locally in your browser (localStorage)**

This means:
- ✅ Your data is **private** - nothing is sent to any server
- ✅ Works **offline** after first load
- ⚠️ Data is **browser-specific** - different browsers = different data
- ⚠️ **Clearing browser data will delete your words and videos**
- ⚠️ Data does **not sync** between devices

**Tip:** Use the same browser consistently and avoid clearing site data!

---

## 🚀 How to Use

### 1️⃣ Add Videos with Subtitles

1. Go to a YouTube video with English content
2. Click **"..." → "Show transcript"** under the video
3. Copy the entire transcript
4. In VocabForge, click **"Add Video"**
5. Fill in:
   - **Title**: Name for the video
   - **YouTube URL**: The video link
   - **Subtitles**: Paste the transcript (format: `0:00 text 0:05 text...`)
6. Click **"Add Video"**

### 2️⃣ Add Words to Learn

1. Click **"Add Word"**
2. Enter:
   - **English Word**: The word you want to learn
   - **Meaning**: Turkish translation or definition
   - **Notes**: (Optional) Extra information
3. Click **"Add Word"**

### 3️⃣ Study Your Words

**Individual Study:**
- Click **"Study Now"**
- Click on any word from the list
- Use **"Show Meaning"** to reveal the translation
- Use **"Find in Videos"** to see the word in context
- Use **"Next Example"** to see more video examples
- Click **"I Know"** or **"Don't Know"**

**Sequential Study (Start All):**
- Click **"Study Now"**
- Click **"Start All"** button
- Video plays automatically for each word
- Click **"I Know"** or **"Don't Know"** to continue
- Progress through all due words automatically

---

## 📊 Spaced Repetition Intervals

| Stage | Interval | Total Time |
|:-----:|:--------:|:----------:|
| 1 | 12 hours | 12 hours |
| 2 | 1 day | 1.5 days |
| 3 | 2 days | 3.5 days |
| 4 | 3 days | 6.5 days |
| 5 | 5 days | 11.5 days |
| 6 | 7 days | 18.5 days |
| 7 | 15 days | 33.5 days |
| ✅ | **Mastered** | Auto-deleted |

**Note:** Clicking "Don't Know" at any stage resets the word to Stage 1 (12 hours).

---

## 🛠️ Installation

### Option 1: Use GitHub Pages (Recommended)

1. Fork this repository
2. Go to **Settings → Pages**
3. Select **Source: Deploy from a branch**
4. Select **Branch: main** and **/ (root)**
5. Click **Save**
6. Your site will be live at: `https://adembtr.github.io/wordsWebsite/`

### Option 2: Local Usage

1. Download or clone this repository
2. Open `index.html` in your browser
3. That's it! No server needed.

---

## 📁 Project Structure

```
vocabforge/
├── index.html      # Main HTML structure
├── style.css       # All styling (dark theme, responsive)
├── script.js       # Application logic
└── README.md       # This file
```

---

## 🎨 Tech Stack

- **HTML5** - Structure
- **CSS3** - Styling with CSS Variables, Flexbox, Grid
- **Vanilla JavaScript** - No frameworks, pure JS
- **YouTube IFrame API** - Video playback control
- **localStorage** - Data persistence

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 💡 Tips for Best Results

1. **Add diverse videos**: News, TED Talks, movies, interviews
2. **Be consistent**: Study every day, even just 5 minutes
3. **Be honest**: Don't click "I Know" if you're unsure
4. **Use context**: Watch video examples multiple times
5. **Add notes**: Include example sentences or etymology

---

<div align="center">

**Made with ❤️ for English learners**

⭐ Star this repo if you find it useful!

</div># wordsWebsite
# wordsWebsite
