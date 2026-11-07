# 🎂 Happy Birthday Kathija! 🎉
A cute, interactive, mobile-friendly birthday celebration website made with love by **madu 🐮** (kanmani✨).

---

## 📁 Project Structure
```text
kathija-birthday-website/
├── index.html         # Main web page structure & content
├── style.css          # Pastel pink/purple/gold styling & animations
├── script.js          # AudioContext, Mic blow detection, Confetti & Lightbox
├── images/            # Photos & optional audio file
│   ├── 1.jpg          # Rooftop panda filter selfie
│   ├── 2.jpg          # Spider-hero pose photo
│   ├── 3.jpg          # Mirror selfie photo
│   ├── 4.jpg          # Cozy portrait photo
│   ├── 5.jpg          # Besties mirror photo
│   └── birthday.mp3   # (Optional) Place any custom song here!
└── README.md          # Setup & GitHub Pages guide
```

---

## ✨ Features
1. **Interaction Gate ("Tap to Start")**: Ensures browser permissions for Web Audio and Microphone work smoothly on iOS & Android.
2. **Interactive Candle with Mic Blow Detection**:
   - Uses Web Audio API `AnalyserNode` to detect real airflow/breath into the mic.
   - **5-Second Auto Fallback**: If mic is blocked, denied, or quiet, the flame automatically blows out after 5 seconds!
   - **Tap Fallback**: Tapping the flame/candle also blows it out instantly.
3. **Celebration Cannon**: Grand multi-stage confetti burst powered by `canvas-confetti`.
4. **Sweet Music Box Chime Synthesizer**: Built-in Web Audio API chime notes play *Happy Birthday* even without an external MP3 file! If you add a `birthday.mp3` into `images/`, it will play your custom MP3 instead.
5. **Interactive 3D Envelope**: Tap the wax seal (stamped with `🐮`) to flip open the flap and unfold the heartfelt birthday letter.
6. **Polaroid Memory Album**: Polaroid-style photo cards with tilt animations, washi tape aesthetics, and full-screen swipeable Lightbox viewer with captions.

---

## 🚀 How to Deploy on GitHub Pages

### Method A: Direct Upload via GitHub Web (Easiest & Fastest - No installation needed!)
1. Go to [GitHub.com](https://github.com) and log in.
2. Click the **+** (plus icon) in the top right corner and select **New repository**.
3. Name your repository (e.g. `kathija-birthday`). Set it to **Public**. Leave other checkboxes unchecked and click **Create repository**.
4. On the next screen, click the link that says **"uploading an existing file"**.
5. Drag and drop the following files & folders from your folder:
   - `index.html`
   - `style.css`
   - `script.js`
   - `images/` folder (with `1.jpg` through `5.jpg`)
6. Click **Commit changes**.
7. Go to **Settings** (tab at the top of your repository) ➔ Click **Pages** (on the left sidebar).
8. Under **Build and deployment** ➔ **Branch**:
   - Select `main` (or `master`)
   - Select folder: `/ (root)`
   - Click **Save**.
9. Wait 1–2 minutes, then refresh the page. You will see your live website link:
   `https://<your-username>.github.io/kathija-birthday/`
10. Send the link to Kathija! 🎁

---

### Method B: Using Git Command Line (If Git is installed)
```bash
cd "C:\Users\helln\.gemini\antigravity\scratch\kathija-birthday-website"
git init
git add .
git commit -m "Happy Birthday Kathija Website"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```
Then turn on **GitHub Pages** from repo Settings ➔ Pages.
