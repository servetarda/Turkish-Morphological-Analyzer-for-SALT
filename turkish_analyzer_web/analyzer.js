// analyzer.js

// Sort suffixes by length descending to try longest matches first

const ORDER_RANKS = {
    // Nouns (0-9)
    "PL": 1, "3PLP": 1.5,
    "1SGP": 2, "2SGP": 2, "3SGP": 2, "1PLP": 2, "2PLP": 2,
    "A": 3, "D": 3, "L": 3, "AB": 3, "ABL": 3, "G": 3, "I": 3,
    // Verbs (10-19)
    "PASS": 10, "CAUS": 10,
    "ABIL": 11,
    "N": 12, "NMLZ": 12.5, "SCON": 12.5, "SICON": 12.5,
    "AOR": 13, "PROG": 13, "FUT": 13, "DEV": 13, "INEV": 13, "COND": 13, "NEC": 13, "HAB": 13,
    "1SG": 14, "2SG": 14, "3SG": 14, "1PL": 14, "2PL": 14, "3PL": 14,
    // 3PL overlaps with Nouns, handled dynamically below
    // Universal
    "COP": 20, "QUESTION": 20
};
const sortedSuffixKeys = Object.keys(SUFFIXES).sort((a, b) => b.length - a.length);

class Parsing {
    constructor(root, root_pos, suffixes) {
        this.root = root;
        this.root_pos = root_pos;
        this.suffixes = suffixes;
    }
}

function analyze(word) {
    // Preserve case for output, but analyze in lowercase
    const lowerWord = word.toLowerCase();
    const validParsings = [];

    function backtrack(currentWord, currentSuffixes) {
        if (ROOTS[currentWord]) {
            const rootPos = ROOTS[currentWord];
            
            let currentPos = rootPos;
            let isValid = true;
            
            // Validate suffixes left-to-right (root to end)
            for (let i = currentSuffixes.length - 1; i >= 0; i--) {
                const suf = currentSuffixes[i];
                if (!suf.attaches_to.includes(currentPos)) {
                    isValid = false;
                    break;
                }
                if (suf.yields_pos) {
                    currentPos = suf.yields_pos;
                }
            }
            
            if (isValid) {
                validParsings.push(new Parsing(currentWord, rootPos, [...currentSuffixes].reverse()));
            }
        }
        
        for (let suffixStr of sortedSuffixKeys) {
            if (currentWord.endsWith(suffixStr) && currentWord.length > suffixStr.length) {
                const stem = currentWord.slice(0, -suffixStr.length);
                const suffixInfos = Array.isArray(SUFFIXES[suffixStr]) ? SUFFIXES[suffixStr] : [SUFFIXES[suffixStr]];
                
                // --- PHONOLOGICAL OPERATIONS ---
                let possibleStems = new Set([stem]);
                const firstCharOfSuffix = suffixStr.charAt(0);
                const isVowel = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'].includes(firstCharOfSuffix);
                
                if (isVowel && stem.length > 0) {
                    const lastChar = stem.charAt(stem.length - 1);
                    
                    // 1. Voicing Reversal (Ünsüz Yumuşaması): b->p, c->ç, d->t, ğ/g->k
                    const unvoiceMap = { 'b': 'p', 'c': 'ç', 'd': 't', 'ğ': 'k', 'g': 'k' };
                    if (unvoiceMap[lastChar]) {
                        possibleStems.add(stem.slice(0, -1) + unvoiceMap[lastChar]);
                    }
                    
                    if (stem.length > 1) {
                        const secondToLast = stem.charAt(stem.length - 2);
                        const isConsonant = (c) => c && !['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'].includes(c);
                        
                        // 2. Consonant Gemination Reversal (Ünsüz Türemesi): hakk -> hak
                        if (lastChar === secondToLast && isConsonant(lastChar)) {
                            possibleStems.add(stem.slice(0, -1));
                        }
                        
                        // 3. Vowel Elision Reversal (Ünlü Düşmesi): akl -> akıl
                        if (isConsonant(lastChar) && isConsonant(secondToLast)) {
                            const vowels = ['ı', 'i', 'u', 'ü'];
                            for (let v of vowels) {
                                possibleStems.add(stem.slice(0, -1) + v + lastChar);
                            }
                        }
                    }
                }
                
                // 4. Vowel Narrowing Reversal (Ünlü Daralması)
                if (suffixStr === "yor") {
                    if (stem.length > 0) {
                        const lastStemChar = stem.charAt(stem.length - 1);
                        if (['ı', 'i', 'u', 'ü'].includes(lastStemChar)) {
                            possibleStems.add(stem.slice(0, -1) + 'a');
                            possibleStems.add(stem.slice(0, -1) + 'e');
                        }
                    }
                } else if (['ıyor', 'iyor', 'uyor', 'üyor'].includes(suffixStr)) {
                    possibleStems.add(stem + 'a');
                    possibleStems.add(stem + 'e');
                }
                
                // 5. Irregular Pronoun Mutations (bana -> ben+a)
                if (stem === "ban") possibleStems.add("ben");
                if (stem === "san") possibleStems.add("sen");
                
                for (let info of suffixInfos) {
                    currentSuffixes.push({ 
                        morpheme: suffixStr, 
                        tag: info.tag, 
                        attaches_to: info.attaches_to,
                        yields_pos: info.yields_pos
                    });
                    
                    for (let pStem of possibleStems) {
                        backtrack(pStem, currentSuffixes);
                    }
                    
                    currentSuffixes.pop();
                }
            }
        }
    }

    backtrack(lowerWord, []);
    return validParsings;
}

// Audio Transcription
document.getElementById('transcribeBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('audioFile');
    const statusDiv = document.getElementById('transcribeStatus');
    const textInput = document.getElementById('textInput');
    
    if (fileInput.files.length === 0) {
        alert("Please select an audio file first. / Lütfen önce bir ses dosyası seçin.");
        return;
    }
    
    const file = fileInput.files[0];
    statusDiv.style.display = 'block';
    statusDiv.textContent = 'Transcribing with local Whisper... This might take a minute. / Yerel Whisper ile deşifre ediliyor... Bu bir dakika sürebilir.';
    statusDiv.style.color = 'var(--text-main)';
    
    try {
        const response = await fetch('/transcribe', {
            method: 'POST',
            body: file
        });
        
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        textInput.value = data.transcript;
        statusDiv.textContent = 'Transcription complete! / Deşifre tamamlandı!';
        statusDiv.style.color = '#10b981';
        
        // Auto analyze after transcription
        document.getElementById('analyzeBtn').click();
    } catch (error) {
        console.error(error);
        statusDiv.textContent = `Error: Failed to transcribe. Make sure the python server is running. / Hata: Deşifre başarısız oldu. Python sunucusunun çalıştığından emin olun.`;
        statusDiv.style.color = '#ef4444';
    }
});

// UI Interaction
document.getElementById('analyzeBtn').addEventListener('click', () => {
    const text = document.getElementById('textInput').value;
    
    if (!text) {
        alert("Please paste some text first. / Lütfen önce biraz metin yapıştırın.");
        return;
    }

    const lines = text.split('\n');
    const enrichedLines = [];
    
    // Metrics trackers
    let totalMorphemes = 0;
    let totalWords = 0;
    let uniqueRoots = new Set();

    for (let line of lines) {
        let trimmed = line.trim();
        if (trimmed === '' || trimmed.startsWith('Y ')) {
            enrichedLines.push(line);
            continue;
        }

        const tokens = line.split(/\s+/);
        const processedTokens = [];
        let hasGenitiveContext = false;
        let genitivePerson = null;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const isLastWord = (i === tokens.length - 1);
            
            // strip punctuation for analysis, but remember it
            const cleanWord = token.replace(/[.,!?()[\]{};:"']/g, '');
            const punctMatch = token.match(/[.,!?()[\]{};:"']+$/);
            const punctuation = punctMatch ? punctMatch[0] : '';
            const prefixMatch = token.match(/^[$@=+-]+/);
            const prefix = prefixMatch ? prefixMatch[0] : '';

            // Handle pure punctuation or SALT speaker tokens like "$"
            if (!cleanWord) {
                processedTokens.push(token);
                continue;
            }

            const parsings = analyze(cleanWord);
            
            if (parsings.length > 0) {
                let bestParsing = null;
                
                // Score parsings to find the best one based on heuristics
                let bestScore = -9999;
                
                for (let p of parsings) {
                    let score = 0;
                    const tags = p.suffixes.map(s => s.tag);
                    
                    // HEURISTIC: No Genitive after Genitive
                    if (hasGenitiveContext && tags.includes("G")) {
                        score -= 100;
                    }
                    
                    // HEURISTIC: Pronominal Agreement
                    if (genitivePerson) {
                        const targetTag = genitivePerson;
                        const otherPossessives = ["1SGP", "2SGP", "3SGP", "1PLP", "2PLP", "3PLP"].filter(t => t !== targetTag);
                        
                        // Reward the correct possessive
                        if (tags.includes(targetTag)) {
                            score += 50;
                        }
                        // Heavily penalize incorrect possessives
                        if (tags.some(t => otherPossessives.includes(t))) {
                            score -= 100;
                        }
                    }
                    
                    // HEURISTIC: No NMLZ at end of sentence
                    if (isLastWord && tags.length > 0) {
                        // NMLZ at the very end of the word is penalized
                        if (tags[tags.length - 1] === "NMLZ") {
                            score -= 100;
                        }
                    }

                    // STRICT MORPHOTACTIC SEQUENCE VALIDATION
                    let currentRank = 0;
                    let currentPosClass = p.root_pos;
                    for (let s of p.suffixes) {
                        let rank = ORDER_RANKS[s.tag];
                        
                        // Handle PL dynamic ranking for verbs
                        if (s.tag === "PL") {
                            rank = (currentPosClass === "VERB") ? 14 : 1;
                        }
                        
                        // Handle Copular DEV/COND dynamically (yapıyordu, yapıyorlardı)
                        if (s.tag === "DEV" || s.tag === "COND") {
                            if (currentRank >= 13) rank = 21;
                            else rank = 13;
                        }
                        
                        // If tag changes the POS, reset rank to 0
                        if (s.yields_pos) {
                            currentPosClass = s.yields_pos;
                            currentRank = 0;
                            continue; // Skip rank check for the derivational suffix itself
                        }
                        
                        if (rank !== undefined) {
                            if (rank < currentRank) {
                                // Strictly penalize violations of suffix order
                                score -= 500;
                            } else if (rank === currentRank && rank <= 3) {
                                // Prevent double Case, double Possessive, and double Plural
                                score -= 500;
                            }
                            currentRank = rank;
                        }
                    }
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestParsing = p;
                    }
                }
                
                if (!bestParsing) bestParsing = parsings[0];
                
                // Update context for the next word
                const bestTags = bestParsing.suffixes.map(s => s.tag);
                if (bestTags.includes("G")) {
                    hasGenitiveContext = true;
                    const rootLower = bestParsing.root.toLowerCase();
                    if (rootLower === 'ben') genitivePerson = '1SGP';
                    else if (rootLower === 'sen') genitivePerson = '2SGP';
                    else if (rootLower === 'o') genitivePerson = '3SGP';
                    else if (rootLower === 'biz') genitivePerson = '1PLP';
                    else if (rootLower === 'siz') genitivePerson = '2PLP';
                    else if (rootLower === 'onlar') genitivePerson = '3PLP';
                    else genitivePerson = null; // Standard noun genitive
                } else {
                    hasGenitiveContext = false;
                    genitivePerson = null;
                }

                // Metrics
                totalWords++;
                uniqueRoots.add(bestParsing.root.toLowerCase());
                totalMorphemes += 1 + bestParsing.suffixes.length;

                let formatted = bestParsing.root;
                
                // Preserve capitalization if original word was capitalized
                if (cleanWord[0] === cleanWord[0].toUpperCase()) {
                    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
                }
                
                for (let suf of bestParsing.suffixes) {
                    formatted += `/${suf.morpheme}[${suf.tag}]`;
                }
                
                // Add back prefix and punctuation
                processedTokens.push(prefix + formatted + punctuation);
            } else {
                // Unknown word, keep as is
                processedTokens.push(token);
                hasGenitiveContext = false; // reset context on unknown word
                genitivePerson = null;
                
                // Metrics for unknown word
                if (cleanWord) {
                    totalWords++;
                    uniqueRoots.add(cleanWord.toLowerCase());
                    totalMorphemes += 1;
                }
            }
        }
        
        enrichedLines.push(processedTokens.join(' '));
    }

    const outputText = enrichedLines.join('\n');
    document.getElementById('resultsText').value = outputText;
    document.getElementById('resultsSection').style.display = 'block';

    // Calculate Utterances
    const utteranceRegex = /[.!?]+|\n+/g;
    let utterances = text.split(utteranceRegex).filter(u => u.trim().length > 0).length;
    if (utterances === 0) utterances = 1;

    const mlu = (totalWords / utterances).toFixed(2);
    const mlum = (totalMorphemes / utterances).toFixed(2);
    const ndw = uniqueRoots.size;

    document.getElementById('metricMLU').textContent = mlu;
    document.getElementById('metricMLUm').textContent = mlum;
    document.getElementById('metricNDW').textContent = ndw;
    document.getElementById('metricsSection').style.display = 'block';
});

// Copy to clipboard
document.getElementById('copyBtn').addEventListener('click', () => {
    const outputTextarea = document.getElementById('resultsText');
    outputTextarea.select();
    document.execCommand('copy');
    
    const btn = document.getElementById('copyBtn');
    const originalText = btn.textContent;
    btn.textContent = 'Copied! / Kopyalandı!';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
});
