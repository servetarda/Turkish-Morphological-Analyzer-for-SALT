# Turkish Morphological Analyzer for SALT

A web-based tool designed for the **morphological analysis of Turkish text**, specifically optimized for **SALT (Systematic Analysis of Language Transcripts)** formatting[cite: 2]. This analyzer utilizes a backtracking algorithm combined with linguistic heuristic scoring to provide accurate morphological breakdowns[cite: 1].

## 🚀 Features

*   **Morphological Breakdown**: Decomposes Turkish words into Root + Suffix components[cite: 1].
*   **SALT Compliance**: Automatically formats output using the `root/morpheme[tag]` notation required for SALT transcripts[cite: 1, 2].
*   **Heuristic Scoring Engine**: Resolves linguistic ambiguities by scoring potential parsings based on:
    *   **Pronominal Agreement**: Tracks genitive context (e.g., "Benim") to reward correct possessive suffix matches on subsequent words[cite: 1].
    *   **Morphotactic Validation**: Enforces strict suffix ordering rules to prevent illegal combinations like double plurals or double cases[cite: 1].
    *   **Capitalization Preservation**: Maintains the original case of analyzed words in the output[cite: 1].
*   **Modern UI**: Features a responsive design using the "Inter" font family and custom CSS properties[cite: 2, 3].
*   **Copy to Clipboard**: One-click functionality to export analyzed transcripts for research use[cite: 1, 2].

## 🛠️ Technical Implementation

### Core Logic (`analyzer.js`)
The analysis engine employs a **backtracking search** through potential suffix matches[cite: 1]. To optimize performance and accuracy, suffixes are sorted by length to attempt the longest matches first[cite: 1].

### Suffix Hierarchy
The tool enforces Turkish grammar through a ranking system (`ORDER_RANKS`)[cite: 1]:
*   **Noun Suffixes**: Plurals (Rank 1), Possessives (Rank 2), and Cases (Rank 3)[cite: 1].
*   **Verb Suffixes**: Passives/Causatives (Rank 10), Ability (Rank 11), Tense (Rank 13), and Person (Rank 14)[cite: 1].
*   **Universal**: Copulas and Question markers (Rank 20)[cite: 1].

## 📂 Project Structure

*   `index.html`: The main user interface and entry point[cite: 2].
*   `style.css`: Modern, clean styling for the web interface[cite: 3].
*   `analyzer.js`: The core logic for word analysis, backtracking, and scoring heuristics[cite: 1].
*   `lexicon.js`: The comprehensive database of Turkish roots and their parts of speech[cite: 4].

## 📦 Usage

1. Open `index.html` in your web browser[cite: 2].
2. Paste your Turkish transcript into the text area[cite: 2].
3. Click **"Analyze Text"** to generate the breakdown[cite: 2].
4. Use the **"Copy to Clipboard"** button to export your annotated data[cite: 2].

---
*Developed for linguistic research and automated transcript annotation.*
