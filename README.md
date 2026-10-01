# VocabForge - Spaced Repetition English Learning

<div align="center">

![VocabForge Banner](https://img.shields.io/badge/VocabForge-English%20Learning-f59e0b?style=for-the-badge&logo=bookstack&logoColor=white)

**A vocabulary learning app that combines spaced repetition with real YouTube video context**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

[**Live Demo**](https://adembtr.github.io/wordsWebsite/) · [How to Use](#how-to-use) · [Features](#features)

</div>

---

## Live Demo

**https://adembtr.github.io/wordsWebsite/**

---

## Features

### Spaced Repetition System (Anki-style)
- **16 review stages**, from 4 hours up to 30 days (see the [interval table](#spaced-repetition-intervals))
- **I Know** moves a word up one stage; **Don't Know** sends it back to stage 1
- Words that reach the final stage count as **mastered** and are removed automatically 30 days after their last review
- Each word shows its current stage (e.g. `Stage 3/16`) and its next review time

### YouTube Video Integration
- Add YouTube videos with their subtitles: paste the transcript or load it from a `.txt` / `.srt` file
- Search for a word across the subtitles of all your videos
- Play **only the segment** that contains the word (playback pauses automatically at the end of the segment)
- See the subtitle sentence with the word highlighted
- **Next Video** cycles through every clip where the word appears; **Replay** repeats the current clip

### Word Variants
- Enter several forms of a word separated by commas, e.g. `open, opened, opening`
- Every form is searched in the subtitles, and **Next Word** switches between the forms that have video matches
- Duplicate words (or overlapping forms) and duplicate videos are rejected

### Study Modes
- **Individual Study**: pick any due word from the list and study it manually
- **Start All**: go through all due words one after another, with the matching clip playing automatically
- Filter your vocabulary: **All / Due / Learning**
- Stats bar with total, due and mastered word counts

### Other Details
- **Export / Import**: back up all words and videos to a JSON file and restore them in another browser or on another device
- **Istanbul time**: live clock and review dates shown in the Europe/Istanbul time zone
- **Mobile responsive** layout
- **Dark theme**

---

## Important: Data Storage

> **All your data is stored locally in your browser (localStorage).**

This means:
- Your data is **private** - words and subtitles are never sent to a server
- Data is **browser-specific** - different browsers = different data
- **Clearing browser data will delete your words and videos**
- Data does **not sync automatically** between devices

**Tip:** Use **Export Data** regularly to keep a backup, and **Import Data** to move your vocabulary to another browser or device. Importing replaces the current data after a confirmation.

An internet connection is needed for the YouTube player and the web fonts.

---

## How to Use

### 1. Add Videos with Subtitles

1. Open a YouTube video with English content
2. Click **"..." → "Show transcript"** under the video
3. Copy the entire transcript
4. In VocabForge, click **"Add Video"**
5. Fill in:
   - **Title**: a name for the video
   - **YouTube URL**: the video link (`youtube.com/watch?v=...`, `youtu.be/...` and embed links work)
   - **Subtitles**: paste the transcript (format: `0:00 text 0:05 text...`) or click **Upload Subtitle File** to load a `.txt` / `.srt` file
6. Click **"Add Video"**

Each timestamp starts a new segment, and a segment ends where the next one begins.

### 2. Add Words to Learn

1. Click **"Add Word"**
2. Enter:
   - **English Word**: the word you want to learn (optionally several forms, separated by commas)
   - **Meaning**: the Turkish translation or a definition
   - **Notes**: (optional) etymology, example sentences, etc.
3. Click **"Add Word"** (or press Enter in the word field)

New words are due for review immediately.

### 3. Study Your Words

**Individual Study:**
- Click **"Study Now"**
- Click any word in the list of due words
- Use **"Find in Videos"** to watch the word in context
- Use **"Next Video"** for more examples and **"Next Word"** to switch between word forms
- Use **"Show Meaning"** to reveal the meaning and notes
- Click **"I Know"** or **"Don't Know"**

**Sequential Study (Start All):**
- Click **"Study Now"**
- Click the **"Start All"** button
- For each word, the first matching clip plays automatically (if one is found)
- Click **"Show Meaning"**, then **"I Know"** or **"Don't Know"** to continue
- A progress bar shows how far you are through the due words

---

## Spaced Repetition Intervals

| Stage | Next review | Stage | Next review |
|:-----:|:-----------:|:-----:|:-----------:|
| 1 | 4 hours | 9 | 4 days |
| 2 | 8 hours | 10 | 5 days |
| 3 | 12 hours | 11 | 7 days |
| 4 | 18 hours | 12 | 10 days |
| 5 | 1 day | 13 | 15 days |
| 6 | 1.5 days | 14 | 20 days |
| 7 | 2 days | 15 | 25 days |
| 8 | 3 days | 16 | 30 days (mastered) |

- A newly added word starts at stage 1 and is due right away.
- **I Know** moves the word to the next stage and schedules the next review using that stage's interval (stage 1 → stage 2 means the next review is in 8 hours).
- **Don't Know** resets the word to stage 1, with the next review in 4 hours.
- Words at stage 16 are removed automatically 30 days after their last review.

---

## Installation

### Option 1: Use GitHub Pages

1. Fork this repository
2. Go to **Settings → Pages**
3. Select **Source: Deploy from a branch**
4. Select **Branch: main** and **/ (root)**
5. Click **Save**
6. Your copy will be live at `https://<your-username>.github.io/wordsWebsite/`

### Option 2: Run Locally

```bash
git clone https://github.com/adembtr/wordsWebsite.git
cd wordsWebsite
python3 -m http.server 8000
```

Then open http://localhost:8000. No build step and no dependencies are needed. You can also open `index.html` directly, but a local server is recommended because the YouTube player may not work on pages opened straight from the file system.

---

## Project Structure

```
wordsWebsite/
├── index.html      # Main HTML structure (modals, study view)
├── style.css       # All styling (dark theme, responsive)
├── script.js       # Application logic (spaced repetition, subtitles, YouTube player)
└── README.md       # This file
```

---

## Tech Stack

- **HTML5** - Structure
- **CSS3** - Styling with CSS variables, Flexbox and Grid
- **Vanilla JavaScript** - No frameworks, no build step
- **YouTube IFrame API** - Video playback control
- **localStorage** - Data persistence
- **Google Fonts** - Sora and Space Mono

---

## Contributing

Contributions are welcome. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Tips for Best Results

1. **Add diverse videos**: news, TED Talks, movies, interviews
2. **Be consistent**: study every day, even just 5 minutes
3. **Be honest**: don't click "I Know" if you're unsure
4. **Use context**: watch the video examples multiple times
5. **Add notes**: include example sentences or etymology

---

Built by [Adem Batur](https://github.com/adembtr)
