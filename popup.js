const btn = document.getElementById('checkButton');

btn.addEventListener('click', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const bodyText = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                return document.body.innerText;
            }
        });

        // Split text into words, excluding numbers
        const allWords = bodyText[0].result.split(/\W+/).filter(word => isNaN(word) && word.length > 3);
       
        const resultDiv = document.getElementById('results');
        resultDiv.innerHTML = '';

        // Check words asynchronously
        const misspelledWords = await checkMisspelledWords(allWords);

        // Display misspelled words
        if (misspelledWords.length > 0) {
            const misspelledList = document.createElement('div');
            misspelledList.textContent = "Misspelled words: " + misspelledWords.join(', ');
            resultDiv.appendChild(misspelledList);
        } else {
            const noMisspelledWord = document.createElement('div');
            noMisspelledWord.textContent = "No misspelled words found.";
            resultDiv.appendChild(noMisspelledWord);
        }

    } catch (error) {
        console.error("Error:", error);
    }
});

async function checkMisspelledWords(words) {
    const misspelledWords = [];
    const checkedWords = new Set();

    // Asynchronously check each word
    await Promise.all(words.map(async (word) => {
        if (!checkedWords.has(word) ) {
            checkedWords.add(word);
            try {
                const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                if (!response.ok) {
                    misspelledWords.push(word);
                }
            } catch (error) {
                console.error("Error checking word:", word, error);
            }
        }
    }));

    return misspelledWords;
}
