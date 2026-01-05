// ===================================
// VocabForge - Spaced Repetition English Learning App
// Complete JavaScript with Video & Subtitle Management
// ===================================

// ===================================
// CONSTANTS & CONFIGURATION
// ===================================
const TIMEZONE = 'Europe/Istanbul';

// Spaced Repetition Intervals (in hours) - Extended version
const INTERVALS = [
    4,         // 4 hours
    8,         // 8 hours
    12,        // 12 hours
    18,        // 18 hours
    24,        // 1 day
    36,        // 1.5 days
    48,        // 2 days
    72,        // 3 days
    96,        // 4 days
    120,       // 5 days
    168,       // 7 days
    240,       // 10 days
    360,       // 15 days
    480,       // 20 days
    600,       // 25 days
    720        // 30 days (final interval before deletion)
];

// ===================================
// GLOBAL STATE
// ===================================
let words = [];
let videos = []; // Array of {id, videoId, url, title, subtitles: [{start, end, text}]}
let currentStudyWord = null;
let currentVideoData = null;
let currentVideoResults = []; // All video results for current word
let currentVideoIndex = 0; // Current index in video results
let player = null;
let isYouTubeAPIReady = false;
let currentFilter = 'all';
let videoCheckInterval = null;

// Sequential study mode
let isSequentialMode = false;
let sequentialWordQueue = [];
let sequentialCurrentIndex = 0;

// ===================================
// YOUTUBE API INITIALIZATION
// ===================================
function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
    console.log('YouTube API is ready');
    isYouTubeAPIReady = true;
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Get current time in Istanbul timezone
 */
function getCurrentTime() {
    const now = new Date();
    const istanbulTime = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
    return istanbulTime;
}

/**
 * Format date to readable string
 */
function formatDate(date) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: TIMEZONE
    };
    return new Date(date).toLocaleString('en-US', options);
}

/**
 * Format time only
 */
function formatTime(date) {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: TIMEZONE,
        hour12: false
    };
    return new Date(date).toLocaleString('en-US', options);
}

/**
 * Format date only
 */
function formatDateOnly(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: TIMEZONE
    };
    return new Date(date).toLocaleString('en-US', options);
}

/**
 * Calculate next review time based on current interval index
 */
function calculateNextReview(intervalIndex) {
    const now = getCurrentTime();
    const hoursToAdd = INTERVALS[intervalIndex];
    return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
}

/**
 * Get human readable interval text
 */
function getIntervalText(intervalIndex) {
    const hours = INTERVALS[intervalIndex];
    if (hours < 24) return `${hours} hours`;
    const days = hours / 24;
    if (days === 1) return '1 day';
    if (days % 1 !== 0) return `${days} days`;
    return `${days} days`;
}

/**
 * Check if a word is due for review
 */
function isDue(word) {
    const now = getCurrentTime();
    return new Date(word.nextReview) <= now;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Format seconds to readable time
 */
function formatSeconds(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse word variants from text (split by comma, dot, or dash)
 * Example: "open,opened,opening" => ["open", "opened", "opening"]
 */
function parseWordVariants(wordText) {
    if (!wordText) return [];
    
    // Split by comma, dot, dash, or semicolon
    const variants = wordText.split(/[,.\-;]+/)
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length > 0);
    
    // Remove duplicates
    return [...new Set(variants)];
}

/**
 * Get display text for word (first variant or full text)
 */
function getWordDisplayText(wordText) {
    const variants = parseWordVariants(wordText);
    if (variants.length > 1) {
        return variants[0] + ` (+${variants.length - 1})`;
    }
    return wordText;
}

// ===================================
// LOCAL STORAGE FUNCTIONS
// ===================================

/**
 * Save words to localStorage
 */
function saveWords() {
    localStorage.setItem('vocabforge_words', JSON.stringify(words));
}

/**
 * Load words from localStorage
 */
function loadWords() {
    const stored = localStorage.getItem('vocabforge_words');
    
    if (stored) {
        words = JSON.parse(stored);
        words.forEach(word => {
            word.nextReview = new Date(word.nextReview);
            word.addedDate = new Date(word.addedDate);
            if (word.lastReviewed) {
                word.lastReviewed = new Date(word.lastReviewed);
            }
        });
    } else {
        words = [];
    }
}

/**
 * Save videos to localStorage
 */
function saveVideos() {
    localStorage.setItem('vocabforge_videos', JSON.stringify(videos));
}

/**
 * Load videos from localStorage
 */
function loadVideos() {
    const stored = localStorage.getItem('vocabforge_videos');
    
    if (stored) {
        videos = JSON.parse(stored);
    } else {
        videos = [];
    }
}

/**
 * Delete words that have passed the final interval
 */
function cleanupOldWords() {
    const now = getCurrentTime();
    const originalLength = words.length;
    
    words = words.filter(word => {
        if (word.intervalIndex >= INTERVALS.length - 1 && word.lastReviewed) {
            const daysSinceLastReview = (now - new Date(word.lastReviewed)) / (1000 * 60 * 60 * 24);
            return daysSinceLastReview < 30; // Changed to 30 days for final interval
        }
        return true;
    });
    
    if (words.length < originalLength) {
        saveWords();
        showToast(`${originalLength - words.length} mastered word(s) removed`, 'success');
    }
}

// ===================================
// SUBTITLE PARSING (MANUAL INPUT)
// ===================================

/**
 * Parse timestamp string to seconds
 * Handles formats: "0:00", "1:23", "12:34", "1:23:45"
 */
function parseTimestamp(timestamp) {
    const parts = timestamp.split(':').map(Number);
    if (parts.length === 2) {
        // MM:SS
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        // HH:MM:SS
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
}

/**
 * Parse manually entered subtitles
 * Format: "0:00 First sentence... 0:05 Second sentence..."
 * Returns array of {start, end, text}
 */
function parseManualSubtitles(subtitleText) {
    if (!subtitleText || !subtitleText.trim()) {
        return null;
    }
    
    // Match timestamps like 0:00, 1:23, 12:34, 1:23:45
    const timestampRegex = /(\d{1,2}:\d{2}(?::\d{2})?)/g;
    
    // Split by timestamps but keep the timestamps
    const parts = subtitleText.split(timestampRegex).filter(part => part.trim());
    
    const subtitles = [];
    let currentTimestamp = null;
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        
        // Check if this part is a timestamp
        if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(part)) {
            currentTimestamp = parseTimestamp(part);
        } else if (currentTimestamp !== null && part.length > 0) {
            // This is text following a timestamp
            subtitles.push({
                start: currentTimestamp,
                end: null, // Will be filled in next step
                text: part.replace(/\n/g, ' ').trim()
            });
        }
    }
    
    // Fill in end times (each segment ends when the next begins)
    for (let i = 0; i < subtitles.length; i++) {
        if (i < subtitles.length - 1) {
            subtitles[i].end = subtitles[i + 1].start;
        } else {
            // Last segment: add 5 seconds as default duration
            subtitles[i].end = subtitles[i].start + 5;
        }
    }
    
    return subtitles.length > 0 ? subtitles : null;
}

// ===================================
// VIDEO MANAGEMENT
// ===================================

/**
 * Add a new video with manually entered subtitles
 */
function addVideo(url, title, subtitleText) {
    const videoId = extractVideoId(url);
    
    if (!videoId) {
        showToast('Invalid YouTube URL!', 'error');
        return false;
    }
    
    if (!title || !title.trim()) {
        showToast('Please enter a title!', 'error');
        return false;
    }
    
    if (!subtitleText || !subtitleText.trim()) {
        showToast('Please paste subtitles!', 'error');
        return false;
    }
    
    // Check if video already exists
    if (videos.find(v => v.videoId === videoId)) {
        showToast('This video is already added!', 'error');
        return false;
    }
    
    // Parse the subtitles
    const subtitles = parseManualSubtitles(subtitleText);
    
    if (!subtitles || subtitles.length === 0) {
        showToast('Could not parse subtitles. Check the format (e.g., 0:00 text 0:05 text...)', 'error');
        return false;
    }
    
    // Create video object
    const newVideo = {
        id: Date.now(),
        videoId: videoId,
        url: url,
        title: title.trim(),
        subtitles: subtitles,
        addedDate: new Date().toISOString(),
        sentenceCount: subtitles.length
    };
    
    videos.push(newVideo);
    saveVideos();
    renderVideoList();
    
    showToast(`Success! Added "${title}" with ${subtitles.length} segments.`, 'success');
    return true;
}

/**
 * Delete a video
 */
function deleteVideo(videoId) {
    videos = videos.filter(v => v.id !== videoId);
    saveVideos();
    renderVideoList();
    showToast('Video deleted.', 'success');
}

/**
 * Search for a single word variant in all video subtitles
 */
function searchSingleWordInSubtitles(word) {
    const wordLower = word.toLowerCase();
    const wordRegex = new RegExp(`\\b${wordLower}\\b`, 'i');
    
    const results = [];
    
    for (const video of videos) {
        if (!video.subtitles) continue;
        
        for (const sentence of video.subtitles) {
            if (wordRegex.test(sentence.text)) {
                results.push({
                    videoId: video.videoId,
                    videoTitle: video.title,
                    sentence: sentence.text,
                    startTime: sentence.start,
                    endTime: sentence.end,
                    matchedWord: word // Track which variant matched
                });
            }
        }
    }
    
    return results;
}

/**
 * Search for a word (with variants) across all video subtitles
 * Supports comma, dot, dash separated variants: "open,opened,opening"
 */
function searchWordInSubtitles(wordText) {
    const variants = parseWordVariants(wordText);
    
    if (variants.length === 0) return [];
    
    const allResults = [];
    
    // Search for each variant and group results
    for (const variant of variants) {
        const variantResults = searchSingleWordInSubtitles(variant);
        allResults.push(...variantResults);
    }
    
    // Sort results: group by variant (in order of input), then by video
    // First, create a map of variant order
    const variantOrder = {};
    variants.forEach((v, index) => {
        variantOrder[v.toLowerCase()] = index;
    });
    
    // Sort: first by variant order, then by video title, then by start time
    allResults.sort((a, b) => {
        const orderA = variantOrder[a.matchedWord.toLowerCase()] || 0;
        const orderB = variantOrder[b.matchedWord.toLowerCase()] || 0;
        
        if (orderA !== orderB) return orderA - orderB;
        if (a.videoTitle !== b.videoTitle) return a.videoTitle.localeCompare(b.videoTitle);
        return a.startTime - b.startTime;
    });
    
    return allResults;
}

// ===================================
// WORD MANAGEMENT
// ===================================

/**
 * Add a new word to the vocabulary list
 */
function addWord(wordText, meaning = '', notes = '') {
    wordText = wordText.trim().toLowerCase();
    
    // Check if any variant already exists
    const newVariants = parseWordVariants(wordText);
    for (const existingWord of words) {
        const existingVariants = parseWordVariants(existingWord.text);
        const overlap = newVariants.filter(v => existingVariants.includes(v));
        if (overlap.length > 0) {
            showToast(`Word variant "${overlap[0]}" already exists!`, 'error');
            return false;
        }
    }
    
    const now = getCurrentTime();
    const newWord = {
        id: Date.now(),
        text: wordText,
        meaning: meaning.trim(),
        notes: notes.trim(),
        intervalIndex: 0,
        nextReview: now,
        addedDate: now,
        lastReviewed: null,
        reviewCount: 0
    };
    
    words.push(newWord);
    saveWords();
    updateUI();
    return true;
}

/**
 * Update word after study session
 */
function updateWordProgress(remembered) {
    if (!currentStudyWord) return;
    
    const word = words.find(w => w.id === currentStudyWord.id);
    if (!word) return;
    
    word.lastReviewed = getCurrentTime();
    word.reviewCount++;
    
    if (remembered) {
        if (word.intervalIndex < INTERVALS.length - 1) {
            word.intervalIndex++;
        }
    } else {
        word.intervalIndex = 0;
    }
    
    word.nextReview = calculateNextReview(word.intervalIndex);
    saveWords();
    updateUI();
}

/**
 * Delete a word from the list
 */
function deleteWord(wordId) {
    words = words.filter(w => w.id !== wordId);
    saveWords();
    updateUI();
}

// ===================================
// UI UPDATE FUNCTIONS
// ===================================

/**
 * Update the current time display
 */
function updateTimeDisplay() {
    const timeElement = document.getElementById('currentTime');
    const dateElement = document.getElementById('currentDate');
    const now = new Date();
    
    if (timeElement) {
        timeElement.textContent = formatTime(now);
    }
    if (dateElement) {
        dateElement.textContent = formatDateOnly(now);
    }
}

/**
 * Update statistics panel
 */
function updateStats() {
    const totalWords = words.length;
    const dueWords = words.filter(w => isDue(w)).length;
    const masteredWords = words.filter(w => w.intervalIndex >= INTERVALS.length - 1).length;
    
    const totalEl = document.getElementById('totalWords');
    const dueEl = document.getElementById('dueWords');
    const masteredEl = document.getElementById('masteredWords');
    const badgeEl = document.getElementById('studyBadge');
    
    if (totalEl) totalEl.textContent = totalWords;
    if (dueEl) dueEl.textContent = dueWords;
    if (masteredEl) masteredEl.textContent = masteredWords;
    if (badgeEl) {
        badgeEl.textContent = dueWords;
        badgeEl.style.display = dueWords > 0 ? 'flex' : 'none';
    }
}

/**
 * Render the word list based on current filter
 */
function renderWordList() {
    const container = document.getElementById('wordList');
    const emptyState = document.getElementById('emptyState');
    
    if (!container) return;
    
    let filteredWords = [...words];
    
    if (currentFilter === 'due') {
        filteredWords = words.filter(w => isDue(w));
    } else if (currentFilter === 'learning') {
        filteredWords = words.filter(w => w.intervalIndex > 0 && w.intervalIndex < INTERVALS.length - 1);
    }
    
    // Sort by next review time (soonest first)
    filteredWords.sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview));
    
    if (filteredWords.length === 0) {
        container.innerHTML = '';
        if (emptyState) {
            emptyState.classList.remove('hidden');
            if (currentFilter !== 'all') {
                emptyState.querySelector('p').textContent = `No ${currentFilter} words found.`;
            } else {
                emptyState.querySelector('p').textContent = 'No words yet. Add your first word to start learning!';
            }
        }
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    container.innerHTML = filteredWords.map(word => {
        const due = isDue(word);
        const status = word.intervalIndex === 0 ? 'new' : 
                      word.intervalIndex < INTERVALS.length - 1 ? 'learning' : 'mastered';
        
        // Display word with variant indicator
        const displayText = getWordDisplayText(word.text);
        
        return `
            <div class="word-item ${due ? 'due' : ''} ${status}" data-id="${word.id}">
                <div class="word-status ${status}"></div>
                <div class="word-info">
                    <div class="word-text">${displayText}</div>
                    <div class="word-meaning-preview">${word.meaning || 'No meaning added'}</div>
                </div>
                <div class="word-meta">
                    <div class="word-stage">Stage ${word.intervalIndex + 1}/${INTERVALS.length}</div>
                    <div class="word-next-review">${due ? 'Due now' : formatDate(word.nextReview)}</div>
                </div>
                <button class="word-delete" onclick="handleDeleteWord(${word.id})" title="Delete word">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
}

/**
 * Render the video list
 */
function renderVideoList() {
    const container = document.getElementById('videoList');
    const emptyState = document.getElementById('emptyVideoState');
    
    if (!container) return;
    
    if (videos.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    container.innerHTML = videos.map(video => `
        <div class="video-item" data-id="${video.id}">
            <div class="video-thumbnail">
                <img src="https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg" alt="${video.title}">
            </div>
            <div class="video-info">
                <div class="video-title">${video.title}</div>
                <div class="video-subtitle-status loaded">
                    ✓ ${video.sentenceCount || video.subtitles?.length || 0} sentences loaded
                </div>
            </div>
            <button class="video-delete" onclick="handleDeleteVideo(${video.id})" title="Delete video">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
            </button>
        </div>
    `).join('');
}

/**
 * Update all UI elements
 */
function updateUI() {
    updateStats();
    renderWordList();
    renderVideoList();
    cleanupOldWords();
}

// ===================================
// MODAL FUNCTIONS
// ===================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function openAddWordModal() {
    openModal('addWordModal');
    const input = document.getElementById('wordInput');
    if (input) {
        input.value = '';
        input.focus();
    }
    document.getElementById('meaningInput').value = '';
    document.getElementById('notesInput').value = '';
}

function closeAddWordModal() {
    closeModal('addWordModal');
}

function openAddVideoModal() {
    openModal('addVideoModal');
    const urlInput = document.getElementById('videoUrlInput');
    const titleInput = document.getElementById('videoTitleInput');
    const subtitlesInput = document.getElementById('subtitlesInput');
    const fileNameDisplay = document.getElementById('uploadedFileName');
    
    if (urlInput) urlInput.value = '';
    if (titleInput) {
        titleInput.value = '';
        titleInput.focus();
    }
    if (subtitlesInput) subtitlesInput.value = '';
    if (fileNameDisplay) fileNameDisplay.textContent = '';
}

function closeAddVideoModal() {
    closeModal('addVideoModal');
}

/**
 * Handle subtitle file upload
 */
function handleSubtitleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }
    
    console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    // Check file extension (more reliable than MIME type on mobile)
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.txt', '.srt'];
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
        showToast('Please upload a .txt or .srt file', 'error');
        event.target.value = ''; // Reset input
        return;
    }
    
    // Check file size (limit to 10MB for safety)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showToast('File is too large! Maximum size is 10MB', 'error');
        event.target.value = ''; // Reset input
        return;
    }
    
    // Show loading state on the label (not button anymore)
    const uploadLabel = document.querySelector('label[for="subtitleFileInput"]');
    const originalHTML = uploadLabel ? uploadLabel.innerHTML : '';
    if (uploadLabel) {
        uploadLabel.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
            </svg>
            Reading file...
        `;
        uploadLabel.style.pointerEvents = 'none';
    }
    
    // Add spinning animation inline for loading indicator
    const style = document.createElement('style');
    style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
    
    // Read the file
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            
            if (!content) {
                throw new Error('File is empty or could not be read');
            }
            
            console.log('File read successfully, length:', content.length);
            
            // Populate the textarea
            const subtitlesInput = document.getElementById('subtitlesInput');
            if (subtitlesInput) {
                subtitlesInput.value = content;
                console.log('Textarea populated');
            } else {
                console.error('Subtitle textarea not found');
            }
            
            // Show success message
            const fileNameDisplay = document.getElementById('uploadedFileName');
            if (fileNameDisplay) {
                fileNameDisplay.textContent = file.name;
            }
            
            // Restore label
            if (uploadLabel) {
                uploadLabel.innerHTML = originalHTML;
                uploadLabel.style.pointerEvents = '';
            }
            
            showToast(`File "${file.name}" loaded successfully!`, 'success');
            
        } catch (error) {
            console.error('Error processing file:', error);
            showToast('Error processing file. Please try again.', 'error');
            
            // Restore label
            if (uploadLabel) {
                uploadLabel.innerHTML = originalHTML;
                uploadLabel.style.pointerEvents = '';
            }
        }
    };
    
    reader.onerror = function(error) {
        console.error('FileReader error:', error);
        showToast('Error reading file. Please try again.', 'error');
        
        // Restore label
        if (uploadLabel) {
            uploadLabel.innerHTML = originalHTML;
            uploadLabel.style.pointerEvents = '';
        }
        
        // Reset input
        event.target.value = '';
    };
    
    // Start reading the file as text with explicit UTF-8 encoding
    try {
        reader.readAsText(file, 'UTF-8');
    } catch (error) {
        console.error('Error starting file read:', error);
        showToast('Error reading file. Please try again.', 'error');
        
        // Restore label
        if (uploadLabel) {
            uploadLabel.innerHTML = originalHTML;
            uploadLabel.style.pointerEvents = '';
        }
    }
}

function handleSaveWord() {
    const wordInput = document.getElementById('wordInput');
    const meaningInput = document.getElementById('meaningInput');
    const notesInput = document.getElementById('notesInput');
    
    const word = wordInput ? wordInput.value.trim() : '';
    const meaning = meaningInput ? meaningInput.value.trim() : '';
    const notes = notesInput ? notesInput.value.trim() : '';
    
    if (!word) {
        showToast('Please enter a word!', 'error');
        return;
    }
    
    if (addWord(word, meaning, notes)) {
        closeAddWordModal();
        const variants = parseWordVariants(word);
        if (variants.length > 1) {
            showToast(`"${variants[0]}" and ${variants.length - 1} variants added!`, 'success');
        } else {
            showToast(`"${word}" has been added!`, 'success');
        }
    }
}

function handleSaveVideo() {
    const urlInput = document.getElementById('videoUrlInput');
    const titleInput = document.getElementById('videoTitleInput');
    const subtitlesInput = document.getElementById('subtitlesInput');
    
    const url = urlInput ? urlInput.value.trim() : '';
    const title = titleInput ? titleInput.value.trim() : '';
    const subtitles = subtitlesInput ? subtitlesInput.value.trim() : '';
    
    if (!url) {
        showToast('Please enter a YouTube URL!', 'error');
        return;
    }
    
    if (!title) {
        showToast('Please enter a title!', 'error');
        return;
    }
    
    if (!subtitles) {
        showToast('Please paste the subtitles!', 'error');
        return;
    }
    
    const success = addVideo(url, title, subtitles);
    if (success) {
        closeAddVideoModal();
        updateUI();
    }
}

function handleDeleteWord(wordId) {
    const word = words.find(w => w.id === wordId);
    if (!word) return;
    
    const displayText = getWordDisplayText(word.text);
    if (confirm(`Are you sure you want to delete "${displayText}"?`)) {
        deleteWord(wordId);
        showToast(`"${displayText}" has been deleted.`, 'success');
    }
}

function handleDeleteVideo(videoId) {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;
    
    if (confirm(`Are you sure you want to delete "${video.title}"?`)) {
        deleteVideo(videoId);
    }
}

function closeStudyModal() {
    closeModal('studyModal');
    
    const studyListView = document.getElementById('studyListView');
    const singleWordView = document.getElementById('singleWordView');
    
    if (studyListView) studyListView.classList.remove('hidden');
    if (singleWordView) singleWordView.classList.add('hidden');
    
    // Reset study actions visibility
    const studyActions = document.querySelector('.study-actions');
    if (studyActions) {
        studyActions.style.display = 'flex';
    }
    
    // Reset sequential meaning areas
    resetSequentialMeaningAreas();
    
    if (player) {
        try {
            player.stopVideo();
            player.destroy();
        } catch (e) {}
        player = null;
    }
    
    if (videoCheckInterval) {
        clearInterval(videoCheckInterval);
        videoCheckInterval = null;
    }
    
    // Reset all state
    currentStudyWord = null;
    currentVideoData = null;
    currentVideoResults = [];
    currentVideoIndex = 0;
    
    // Reset sequential mode
    isSequentialMode = false;
    sequentialWordQueue = [];
    sequentialCurrentIndex = 0;
}

// ===================================
// VIDEO PLAYER FUNCTIONS
// ===================================

function initializePlayer(videoId, startTime, endTime) {
    // Destroy existing player
    if (player) {
        try {
            player.destroy();
        } catch (e) {}
        player = null;
    }
    
    // Clear the container
    const playerContainer = document.getElementById('youtubePlayer');
    if (playerContainer) {
        playerContainer.innerHTML = '';
    }
    
    // Store end time for checking
    currentVideoData = { videoId, startTime, endTime };
    
    player = new YT.Player('youtubePlayer', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'start': Math.floor(startTime),
            'autoplay': 1,
            'controls': 1,
            'rel': 0,
            'modestbranding': 1,
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log('Player ready, seeking to:', currentVideoData.startTime);
    event.target.seekTo(currentVideoData.startTime);
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING && currentVideoData) {
        // Clear any existing interval
        if (videoCheckInterval) {
            clearInterval(videoCheckInterval);
        }
        
        // Check every 100ms if we've reached the end time
        videoCheckInterval = setInterval(() => {
            if (player && typeof player.getCurrentTime === 'function') {
                const currentTime = player.getCurrentTime();
                if (currentTime >= currentVideoData.endTime) {
                    player.pauseVideo();
                    clearInterval(videoCheckInterval);
                    videoCheckInterval = null;
                }
            }
        }, 100);
    }
}

function watchAgain() {
    if (player && currentVideoData && typeof player.seekTo === 'function') {
        player.seekTo(currentVideoData.startTime);
        player.playVideo();
    }
}

// ===================================
// STUDY SESSION FUNCTIONS
// ===================================

function startStudySession() {
    const dueWords = words.filter(w => isDue(w));
    
    if (dueWords.length === 0) {
        showToast('No words are due for review right now!', 'error');
        return;
    }
    
    openModal('studyModal');
    
    const studyListView = document.getElementById('studyListView');
    const singleWordView = document.getElementById('singleWordView');
    
    if (studyListView) studyListView.classList.remove('hidden');
    if (singleWordView) singleWordView.classList.add('hidden');
    
    updateStudyProgress(0, dueWords.length);
    
    const dueWordsList = document.getElementById('dueWordsList');
    if (dueWordsList) {
        dueWordsList.innerHTML = dueWords.map(word => {
            const displayText = getWordDisplayText(word.text);
            return `
                <div class="due-word-item" onclick="startWordStudy(${word.id})">
                    <span class="due-word-text">${displayText}</span>
                    <span class="due-word-stage">Stage ${word.intervalIndex + 1}</span>
                </div>
            `;
        }).join('');
    }
}

function updateStudyProgress(current, total) {
    const progressText = document.getElementById('studyProgressText');
    const progressBar = document.getElementById('studyProgressBar');
    
    if (progressText) progressText.textContent = `${current} / ${total}`;
    if (progressBar) {
        const percentage = total > 0 ? (current / total) * 100 : 0;
        progressBar.style.width = `${percentage}%`;
    }
}

function startWordStudy(wordId) {
    currentStudyWord = words.find(w => w.id === wordId);
    if (!currentStudyWord) return;
    
    // Reset video results
    currentVideoResults = [];
    currentVideoIndex = 0;
    
    const studyListView = document.getElementById('studyListView');
    const singleWordView = document.getElementById('singleWordView');
    
    if (studyListView) studyListView.classList.add('hidden');
    if (singleWordView) singleWordView.classList.remove('hidden');
    
    // Update word display - show all variants
    document.getElementById('wordStage').textContent = `Stage ${currentStudyWord.intervalIndex + 1}`;
    
    const variants = parseWordVariants(currentStudyWord.text);
    const displayWord = variants.length > 1 ? variants.join(', ') : currentStudyWord.text;
    document.getElementById('studyWordMain').textContent = displayWord;
    
    const meaningEl = document.getElementById('studyWordMeaning');
    const notesEl = document.getElementById('studyWordNotes');
    
    if (meaningEl) {
        meaningEl.textContent = currentStudyWord.meaning || 'No meaning added';
        meaningEl.classList.add('hidden');
    }
    if (notesEl) {
        notesEl.textContent = currentStudyWord.notes || '';
        notesEl.classList.add('hidden');
    }
    
    // Reset UI elements
    document.getElementById('videoPlayerArea')?.classList.add('hidden');
    document.getElementById('noVideoMessage')?.classList.add('hidden');
    document.getElementById('responseButtons')?.classList.add('hidden');
    document.getElementById('subtitleDisplay').innerHTML = '';
    
    // Show/hide appropriate buttons based on mode
    const studyActions = document.querySelector('.study-actions');
    if (studyActions) {
        studyActions.style.display = isSequentialMode ? 'none' : 'flex';
    }
    
    // Update next review time display
    const nextReviewTime = document.getElementById('nextReviewTime');
    if (nextReviewTime) {
        const nextInterval = Math.min(currentStudyWord.intervalIndex + 1, INTERVALS.length - 1);
        nextReviewTime.textContent = `Next: ${getIntervalText(nextInterval)}`;
    }
    
    currentVideoData = null;
    
    // If in sequential mode, auto-find video
    if (isSequentialMode) {
        setTimeout(() => {
            autoPlayForSequentialMode();
        }, 300);
    }
}

function showMeaning() {
    document.getElementById('studyWordMeaning')?.classList.remove('hidden');
    if (currentStudyWord?.notes) {
        document.getElementById('studyWordNotes')?.classList.remove('hidden');
    }
    document.getElementById('responseButtons')?.classList.remove('hidden');
}

function findInVideos() {
    if (!currentStudyWord) return;
    
    if (videos.length === 0) {
        showToast('No videos added yet! Add videos first.', 'error');
        return;
    }
    
    if (!isYouTubeAPIReady) {
        showToast('YouTube player is loading, please wait...', 'error');
        return;
    }
    
    // Search for all variants of the word in all subtitles
    currentVideoResults = searchWordInSubtitles(currentStudyWord.text);
    currentVideoIndex = 0;
    
    if (currentVideoResults.length === 0) {
        document.getElementById('videoPlayerArea')?.classList.add('hidden');
        document.getElementById('noVideoMessage')?.classList.remove('hidden');
        const variants = parseWordVariants(currentStudyWord.text);
        const searchedWords = variants.length > 1 ? `"${variants.join('", "')}"` : `"${currentStudyWord.text}"`;
        showToast(`${searchedWords} not found in any video.`, 'error');
        return;
    }
    
    // Play the first result
    playVideoResult(currentVideoIndex);
}

/**
 * Play a specific video result by index
 */
function playVideoResult(index) {
    if (index < 0 || index >= currentVideoResults.length) {
        showToast('No more examples found.', 'error');
        return;
    }
    
    const result = currentVideoResults[index];
    
    document.getElementById('noVideoMessage')?.classList.add('hidden');
    document.getElementById('videoPlayerArea')?.classList.remove('hidden');
    
    // Show the subtitle with highlighted word (highlight the matched variant)
    const subtitleDisplay = document.getElementById('subtitleDisplay');
    if (subtitleDisplay) {
        const highlightedSentence = result.sentence.replace(
            new RegExp(`\\b(${result.matchedWord})\\b`, 'gi'),
            '<span class="highlight">$1</span>'
        );
        subtitleDisplay.innerHTML = `
            <div class="subtitle-time">${formatSeconds(result.startTime)} - ${formatSeconds(result.endTime)}</div>
            <div class="subtitle-text">${highlightedSentence}</div>
            <div class="subtitle-counter">Example ${index + 1} of ${currentVideoResults.length} (matched: "${result.matchedWord}")</div>
        `;
    }
    
    // Initialize player
    initializePlayer(result.videoId, result.startTime, result.endTime);
    
    showToast(`Found "${result.matchedWord}" in: ${result.videoTitle} (${index + 1}/${currentVideoResults.length})`, 'success');
}

/**
 * Play next video example
 */
function nextExample() {
    if (!currentStudyWord) return;
    
    if (currentVideoResults.length === 0) {
        // No results yet, do initial search
        findInVideos();
        return;
    }
    
    // Move to next result
    currentVideoIndex++;
    
    if (currentVideoIndex >= currentVideoResults.length) {
        // Loop back to first
        currentVideoIndex = 0;
        showToast('Looping back to first example.', 'success');
    }
    
    playVideoResult(currentVideoIndex);
}

/**
 * Start sequential study mode - study all due words one by one
 */
function startSequentialStudy() {
    const dueWords = words.filter(w => isDue(w));
    
    if (dueWords.length === 0) {
        showToast('No words are due for review!', 'error');
        return;
    }
    
    // Initialize sequential mode
    isSequentialMode = true;
    sequentialWordQueue = [...dueWords];
    sequentialCurrentIndex = 0;
    
    // Update progress
    updateStudyProgress(0, sequentialWordQueue.length);
    
    // Start with first word
    startWordStudy(sequentialWordQueue[0].id);
}

/**
 * Auto-play video for sequential mode
 */
function autoPlayForSequentialMode() {
    if (!currentStudyWord || !isSequentialMode) return;
    
    // Hide response buttons initially - they show after "Show Meaning" is clicked
    document.getElementById('responseButtons')?.classList.add('hidden');
    
    // Reset the sequential meaning areas
    resetSequentialMeaningAreas();
    
    // Try to find and play video
    if (videos.length > 0 && isYouTubeAPIReady) {
        currentVideoResults = searchWordInSubtitles(currentStudyWord.text);
        currentVideoIndex = 0;
        
        if (currentVideoResults.length > 0) {
            playVideoResult(0);
            // Show the sequential meaning area (with video)
            document.getElementById('sequentialMeaningArea')?.classList.remove('hidden');
            document.getElementById('sequentialMeaningAreaNoVideo')?.classList.add('hidden');
        } else {
            document.getElementById('noVideoMessage')?.classList.remove('hidden');
            // Show the sequential meaning area (no video version)
            document.getElementById('sequentialMeaningAreaNoVideo')?.classList.remove('hidden');
            document.getElementById('sequentialMeaningArea')?.classList.add('hidden');
        }
    } else {
        document.getElementById('noVideoMessage')?.classList.remove('hidden');
        // Show the sequential meaning area (no video version)
        document.getElementById('sequentialMeaningAreaNoVideo')?.classList.remove('hidden');
        document.getElementById('sequentialMeaningArea')?.classList.add('hidden');
    }
}

/**
 * Reset sequential meaning areas to initial state
 */
function resetSequentialMeaningAreas() {
    // Reset video version
    const meaningArea = document.getElementById('sequentialMeaningArea');
    const showBtn = document.getElementById('btnShowMeaningSequential');
    const revealed = document.getElementById('sequentialMeaningRevealed');
    
    if (meaningArea) meaningArea.classList.add('hidden');
    if (showBtn) showBtn.style.display = 'flex';
    if (revealed) revealed.classList.add('hidden');
    
    // Reset no-video version
    const meaningAreaNoVideo = document.getElementById('sequentialMeaningAreaNoVideo');
    const showBtnNoVideo = document.getElementById('btnShowMeaningSequentialNoVideo');
    const revealedNoVideo = document.getElementById('sequentialMeaningRevealedNoVideo');
    
    if (meaningAreaNoVideo) meaningAreaNoVideo.classList.add('hidden');
    if (showBtnNoVideo) showBtnNoVideo.style.display = 'flex';
    if (revealedNoVideo) revealedNoVideo.classList.add('hidden');
}

/**
 * Show meaning in sequential mode (called when "Show Meaning" button is clicked)
 */
function showMeaningSequential(isNoVideoVersion = false) {
    if (!currentStudyWord) return;
    
    const suffix = isNoVideoVersion ? 'NoVideo' : '';
    const showBtn = document.getElementById('btnShowMeaningSequential' + suffix);
    const revealed = document.getElementById('sequentialMeaningRevealed' + suffix);
    const meaningText = document.getElementById('sequentialMeaningText' + suffix);
    const notesText = document.getElementById('sequentialNotesText' + suffix);
    
    // Hide the "Show Meaning" button
    if (showBtn) showBtn.style.display = 'none';
    
    // Show the meaning and notes
    if (meaningText) {
        meaningText.textContent = currentStudyWord.meaning || 'No meaning added';
    }
    if (notesText) {
        notesText.textContent = currentStudyWord.notes || '';
    }
    if (revealed) revealed.classList.remove('hidden');
    
    // Now show the response buttons
    document.getElementById('responseButtons')?.classList.remove('hidden');
}

/**
 * Move to next word in sequential mode
 */
function nextSequentialWord() {
    sequentialCurrentIndex++;
    
    if (sequentialCurrentIndex >= sequentialWordQueue.length) {
        // All done!
        showToast('🎉 Great job! All reviews completed!', 'success');
        closeStudyModal();
        return;
    }
    
    // Update progress
    updateStudyProgress(sequentialCurrentIndex, sequentialWordQueue.length);
    
    // Stop current video
    if (player) {
        try {
            player.stopVideo();
            player.destroy();
        } catch (e) {}
        player = null;
    }
    
    if (videoCheckInterval) {
        clearInterval(videoCheckInterval);
        videoCheckInterval = null;
    }
    
    // Start next word
    startWordStudy(sequentialWordQueue[sequentialCurrentIndex].id);
}

function handleKnow() {
    updateWordProgress(true);
    showToast('Great job! Moving to next interval.', 'success');
    
    if (isSequentialMode) {
        nextSequentialWord();
    } else {
        continueOrEndStudy();
    }
}

function handleDontKnow() {
    updateWordProgress(false);
    showToast('No problem! Interval reset for more practice.', 'error');
    
    if (isSequentialMode) {
        nextSequentialWord();
    } else {
        continueOrEndStudy();
    }
}

function continueOrEndStudy() {
    const remainingDueWords = words.filter(w => isDue(w));
    
    if (remainingDueWords.length > 0) {
        document.getElementById('studyListView')?.classList.remove('hidden');
        document.getElementById('singleWordView')?.classList.add('hidden');
        
        if (player) {
            try {
                player.stopVideo();
                player.destroy();
            } catch (e) {}
            player = null;
        }
        
        if (videoCheckInterval) {
            clearInterval(videoCheckInterval);
            videoCheckInterval = null;
        }
        
        const dueWordsList = document.getElementById('dueWordsList');
        if (dueWordsList) {
            dueWordsList.innerHTML = remainingDueWords.map(word => {
                const displayText = getWordDisplayText(word.text);
                return `
                    <div class="due-word-item" onclick="startWordStudy(${word.id})">
                        <span class="due-word-text">${displayText}</span>
                        <span class="due-word-stage">Stage ${word.intervalIndex + 1}</span>
                    </div>
                `;
            }).join('');
        }
        
        currentStudyWord = null;
        currentVideoData = null;
    } else {
        showToast('🎉 Great job! All reviews completed!', 'success');
        closeStudyModal();
    }
}

// ===================================
// EVENT LISTENERS
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Load YouTube API
    loadYouTubeAPI();
    
    // Load data from localStorage
    loadWords();
    loadVideos();
    updateUI();
    updateTimeDisplay();
    
    // Update time every second
    setInterval(updateTimeDisplay, 1000);
    
    // Update UI every minute
    setInterval(updateUI, 60000);
    
    // Export/Import Buttons
    document.getElementById('btnExport')?.addEventListener('click', exportData);
    document.getElementById('btnImport')?.addEventListener('click', () => {
        document.getElementById('importFileInput')?.click();
    });
    document.getElementById('importFileInput')?.addEventListener('change', importData);

    // Add Word Button
    document.getElementById('btnAdd')?.addEventListener('click', openAddWordModal);
    document.getElementById('closeAddModal')?.addEventListener('click', closeAddWordModal);
    document.getElementById('cancelAddWord')?.addEventListener('click', closeAddWordModal);
    document.getElementById('confirmAddWord')?.addEventListener('click', handleSaveWord);
    
    // Add Video Button
    document.getElementById('btnAddVideo')?.addEventListener('click', openAddVideoModal);
    document.getElementById('closeVideoModal')?.addEventListener('click', closeAddVideoModal);
    document.getElementById('cancelAddVideo')?.addEventListener('click', closeAddVideoModal);
    document.getElementById('confirmAddVideo')?.addEventListener('click', handleSaveVideo);
    
    // Subtitle File Upload - direct event on file input
    const subtitleFileInput = document.getElementById('subtitleFileInput');
    if (subtitleFileInput) {
        subtitleFileInput.addEventListener('change', handleSubtitleFileUpload);
        
        // For better mobile support, also handle click event
        subtitleFileInput.addEventListener('click', function() {
            this.value = null; // Reset to allow re-selecting the same file
        });
    }
    
    // Study Button
    document.getElementById('btnStudy')?.addEventListener('click', startStudySession);
    document.getElementById('backFromStudy')?.addEventListener('click', closeStudyModal);
    document.getElementById('btnStartAll')?.addEventListener('click', startSequentialStudy);
    
    // Study Actions
    document.getElementById('btnShowMeaning')?.addEventListener('click', showMeaning);
    document.getElementById('btnFindVideo')?.addEventListener('click', findInVideos);
    document.getElementById('btnReplay')?.addEventListener('click', watchAgain);
    document.getElementById('btnNextExample')?.addEventListener('click', nextExample);
    document.getElementById('btnKnow')?.addEventListener('click', handleKnow);
    document.getElementById('btnDontKnow')?.addEventListener('click', handleDontKnow);
    
    // Sequential Mode Show Meaning buttons
    document.getElementById('btnShowMeaningSequential')?.addEventListener('click', () => showMeaningSequential(false));
    document.getElementById('btnShowMeaningSequentialNoVideo')?.addEventListener('click', () => showMeaningSequential(true));
    
    // Filter Tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            renderWordList();
        });
    });
    
    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', () => {
            const modal = backdrop.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                if (modal.id === 'studyModal') {
                    closeStudyModal();
                }
            }
        });
    });
    
    // Enter key handlers
    document.getElementById('wordInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSaveWord();
    });
    
    document.getElementById('videoUrlInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSaveVideo();
    });
});

// ===================================
// GLOBAL EXPORTS
// ===================================
window.startWordStudy = startWordStudy;
window.handleDeleteWord = handleDeleteWord;
window.handleDeleteVideo = handleDeleteVideo;
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.nextExample = nextExample;
window.showMeaningSequential = showMeaningSequential;


// ===================================
// DATA EXPORT/IMPORT FUNCTIONS
// ===================================

/**
 * Export all data to JSON file
 */
function exportData() {
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        words: words,
        videos: videos
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocabforge-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`Exported ${words.length} words and ${videos.length} videos!`, 'success');
}

/**
 * Import data from JSON file
 */
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.words || !data.videos) {
                throw new Error('Invalid backup file format');
            }
            
            // Confirm before overwriting
            const wordCount = data.words.length;
            const videoCount = data.videos.length;
            
            if (confirm(`This will replace your current data with:\n- ${wordCount} words\n- ${videoCount} videos\n\nContinue?`)) {
                // Restore words
                words = data.words;
                words.forEach(word => {
                    word.nextReview = new Date(word.nextReview);
                    word.addedDate = new Date(word.addedDate);
                    if (word.lastReviewed) {
                        word.lastReviewed = new Date(word.lastReviewed);
                    }
                });
                saveWords();
                
                // Restore videos
                videos = data.videos;
                saveVideos();
                
                // Update UI
                updateUI();
                
                showToast(`Imported ${wordCount} words and ${videoCount} videos!`, 'success');
            }
        } catch (error) {
            console.error('Import error:', error);
            showToast('Error importing file. Make sure it\'s a valid backup.', 'error');
        }
    };
    
    reader.readAsText(file);
    
    // Reset input so same file can be selected again
    event.target.value = '';
}