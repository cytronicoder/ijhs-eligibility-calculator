document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("contests.json");
    const contestData = await response.json();

    const paexsContests = ["IJMO", "VIJSO", "IJIO", "IJCO", "IJAO"];
    const sitContests = ["AMO", "SASMO", "SIAT", "VNJSO", "NJIO", "NJCO"];

    function getContestIcon(contestName) {
        const name = contestName.toLowerCase();

        if (name.includes('math') || name.includes('mo') || name.includes('sasmo') ||
            name.includes('amc') || name.includes('smc') || name.includes('mmt') ||
            name.includes('smgf') || name.includes('smkc') || name.includes('simoc') ||
            name.includes('amo') || name.includes('ijmo')) {
            return "🔢";
        }

        if (name.includes('science') || name.includes('jso') || name.includes('physics') ||
            name.includes('biology') || name.includes('chemistry') || name.includes('vijso') ||
            name.includes('vnjso') || name.includes('siat') || name.includes('ijco') ||
            name.includes('njco')) {
            return "🧪";
        }

        if (name.includes('cs') || name.includes('informatics') || name.includes('io') ||
            name.includes('bebras') || name.includes('computing') || name.includes('programming') ||
            name.includes('ijio') || name.includes('njio') || name.includes('coding')) {
            return "💻";
        }

        if (name.includes('astronomy') || name.includes('ao') || name.includes('ijao') ||
            name.includes('space') || name.includes('astro')) {
            return "🌟";
        }

        if (name.includes('art') || name.includes('design') || name.includes('creative') ||
            name.includes('visual') || name.includes('drawing') || name.includes('painting')) {
            return "🎨";
        }

        return "🏆";
    }

    function getAssessmentYear() {
        const now = new Date(), y = now.getFullYear();
        return now.getMonth() >= 7 ? `${y - 1}-${y}` : `${y - 2}-${y - 1}`;
    }
    function getPeriod() {
        const now = new Date(), y = now.getFullYear(), m = now.getMonth();
        let start, end;
        if (m >= 7) {
            start = new Date(y - 1, 7, 1);
            end = new Date(y, 6, 31);
        } else {
            start = new Date(y - 2, 7, 1);
            end = new Date(y - 1, 6, 31);
        }
        return { start, end };
    }

    document.getElementById("yearDisplay").innerText = getAssessmentYear();
    const period = getPeriod();
    document.getElementById("period").innerText =
        period.start.toLocaleDateString() + " - " + period.end.toLocaleDateString();

    function addRow() {
        const row = document.createElement("div");
        row.className = "row";
        row.draggable = true;

        const dragHandle = document.createElement("div");
        dragHandle.className = "drag-handle";
        dragHandle.innerHTML = "⋮⋮";
        dragHandle.title = "Drag to reorder rows";

        const contestContainer = document.createElement("div");
        contestContainer.className = "contest-input-container";

        const contestInput = document.createElement("input");
        contestInput.className = "contest-input";
        contestInput.type = "text";
        contestInput.placeholder = "Search contest...";
        contestInput.autocomplete = "off";

        const suggestions = document.createElement("div");
        suggestions.className = "contest-suggestions";

        contestContainer.appendChild(contestInput);
        contestContainer.appendChild(suggestions);

        const contestNames = Object.keys(contestData);
        let selectedContest = null;
        let highlightedIndex = -1;

        function showSuggestions(filter = "") {
            const filtered = contestNames.filter(name =>
                name.toLowerCase().includes(filter.toLowerCase())
            );

            suggestions.innerHTML = "";
            highlightedIndex = -1;

            if (filtered.length > 0 && filter) {
                filtered.forEach((name, index) => {
                    const suggestion = document.createElement("div");
                    suggestion.className = "contest-suggestion";
                    const icon = getContestIcon(name);

                    const awards = Object.keys(contestData[name]);
                    const topAward = awards[0];
                    const topSP = contestData[name][topAward];
                    const tooltipText = `${awards.length} awards available. Top award: ${topAward} (${(topSP.ind + topSP.team).toFixed(1)} SP)`;

                    suggestion.innerHTML = `${icon} ${name}`;
                    suggestion.title = tooltipText;
                    suggestion.onclick = () => selectContest(name);
                    suggestions.appendChild(suggestion);
                });
                suggestions.style.display = "block";
            } else {
                suggestions.style.display = "none";
            }
        }

        function selectContest(name) {
            selectedContest = name;
            contestInput.value = name;
            suggestions.style.display = "none";
            updateAwards();
        }

        function updateAwards() {
            if (selectedContest && contestData[selectedContest]) {
                const opts = Object.keys(contestData[selectedContest])
                    .map((award) => {
                        const sp = contestData[selectedContest][award];
                        const totalSP = sp.ind + sp.team;
                        const colorClass = totalSP >= 1.5 ? 'high-sp' : totalSP >= 0.5 ? 'medium-sp' : 'low-sp';
                        const tooltip = `Individual: ${sp.ind} SP, Team: ${sp.team} SP, Total: ${totalSP} SP`;
                        return `<option value="${award}" class="${colorClass}" title="${tooltip}">${award} (${totalSP.toFixed(1)} SP)</option>`;
                    })
                    .join("");
                a.innerHTML = "<option disabled selected>Award</option>" + opts;
            } else {
                a.innerHTML = "<option disabled selected>Award</option>";
            }
        }

        contestInput.oninput = (e) => {
            const value = e.target.value;
            selectedContest = contestNames.find(name => name === value) || null;
            showSuggestions(value);
            updateAwards();
        };

        contestInput.onkeydown = (e) => {
            const suggestionElements = suggestions.querySelectorAll('.contest-suggestion');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                highlightedIndex = Math.min(highlightedIndex + 1, suggestionElements.length - 1);
                updateHighlight();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                highlightedIndex = Math.max(highlightedIndex - 1, -1);
                updateHighlight();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (highlightedIndex >= 0 && suggestionElements[highlightedIndex]) {
                    selectContest(suggestionElements[highlightedIndex].textContent.trim());
                } else {
                    const award = row.querySelector('.award');
                    if (award) award.focus();
                }
            } else if (e.key === 'Escape') {
                suggestions.style.display = "none";
                highlightedIndex = -1;
            }
        };

        function updateHighlight() {
            const suggestionElements = suggestions.querySelectorAll('.contest-suggestion');
            suggestionElements.forEach((el, index) => {
                el.classList.toggle('highlighted', index === highlightedIndex);
            });
        }

        contestInput.onblur = (e) => {
            setTimeout(() => {
                if (!contestContainer.contains(document.activeElement)) {
                    suggestions.style.display = "none";
                }
            }, 150);
        };

        const a = document.createElement("select");
        a.className = "award";
        a.innerHTML = "<option disabled selected>Award</option>";

        const d = document.createElement("input");
        d.className = "date";
        d.type = "date";
        d.min = period.start.toISOString().split("T")[0];
        d.max = period.end.toISOString().split("T")[0];

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "X";
        removeBtn.className = "remove-btn";
        removeBtn.type = "button";
        removeBtn.title = "Remove this row";
        removeBtn.onclick = () => {
            row.remove();
            saveToLocalStorage();
            calculateResults();
        };

        const autoSaveElements = [contestInput, a, d];
        autoSaveElements.forEach(element => {
            element.addEventListener('input', () => {
                saveToLocalStorage();
                clearTimeout(window.calcTimeout);
                window.calcTimeout = setTimeout(calculateResults, 300);
            });
            element.addEventListener('change', () => {
                saveToLocalStorage();
                calculateResults();
            });
        });

        const rowElements = [contestInput, a, d, removeBtn];
        rowElements.forEach((element, index) => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                    return;
                } else if (e.key === 'Tab' && e.shiftKey) {
                    return;
                }

                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (index < rowElements.length - 1) {
                        rowElements[index + 1].focus();
                    } else {
                        addRow();
                        saveToLocalStorage();
                        setTimeout(() => {
                            const newRow = document.querySelector('.row:last-child');
                            const firstInput = newRow.querySelector('.contest-input');
                            if (firstInput) firstInput.focus();
                        }, 0);
                    }
                }

                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    const allRows = Array.from(document.querySelectorAll('.row'));
                    const currentRowIndex = allRows.indexOf(row);

                    if (e.key === 'ArrowUp' && currentRowIndex > 0) {
                        e.preventDefault();
                        const targetRow = allRows[currentRowIndex - 1];
                        const targetElement = targetRow.children[index + 1];
                        if (targetElement) targetElement.focus();
                    } else if (e.key === 'ArrowDown' && currentRowIndex < allRows.length - 1) {
                        e.preventDefault();
                        const targetRow = allRows[currentRowIndex + 1];
                        const targetElement = targetRow.children[index + 1];
                        if (targetElement) targetElement.focus();
                    }
                }
            });
        });

        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        let isSwiping = false;

        row.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            isSwiping = false;
        }, { passive: true });

        row.addEventListener('touchmove', (e) => {
            if (!touchStartX) return;

            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;

            const deltaX = touchStartX - touchEndX;
            const deltaY = touchStartY - touchEndY;

            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
                isSwiping = true;
                if (deltaX > 0 && deltaX < 150) {
                    row.classList.add('swipe-delete');
                    row.style.transform = `translateX(-${Math.min(deltaX, 100)}px)`;
                } else {
                    row.classList.remove('swipe-delete');
                    row.style.transform = '';
                }
            }
        }, { passive: true });

        row.addEventListener('touchend', (e) => {
            if (!isSwiping) {
                row.classList.remove('swipe-delete');
                row.style.transform = '';
                return;
            }

            const deltaX = touchStartX - touchEndX;
            const deltaY = touchStartY - touchEndY;

            if (deltaX > 80 && Math.abs(deltaX) > Math.abs(deltaY)) {
                row.style.transform = 'translateX(-100%)';
                row.style.opacity = '0';

                setTimeout(() => {
                    const contestInput = row.querySelector('.contest-input');
                    const awardSelect = row.querySelector('.award');
                    const dateInput = row.querySelector('.date');

                    const hasContent = (contestInput && contestInput.value.trim()) ||
                        (awardSelect && awardSelect.value && awardSelect.value !== 'Award') ||
                        (dateInput && dateInput.value);

                    if (hasContent) {
                        if (confirm('This row contains data. Are you sure you want to delete it?')) {
                            row.remove();
                            saveToLocalStorage();
                            calculateResults();
                        } else {
                            row.style.transform = '';
                            row.style.opacity = '1';
                            row.classList.remove('swipe-delete');
                        }
                    } else {
                        row.remove();
                        saveToLocalStorage();
                        calculateResults();
                    }
                }, 200);
            } else {
                row.classList.remove('swipe-delete');
                row.style.transform = '';
            }

            touchStartX = 0;
            touchStartY = 0;
            isSwiping = false;
        }, { passive: true });

        row.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', row.outerHTML);
            row.classList.add('dragging');
        });

        row.addEventListener('dragend', (e) => {
            row.classList.remove('dragging');
            setTimeout(saveToLocalStorage, 100);
        });

        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const draggingRow = document.querySelector('.dragging');
            if (draggingRow && draggingRow !== row) {
                const rowsContainer = document.getElementById('rows');
                const afterElement = getDragAfterElement(rowsContainer, e.clientY);

                if (afterElement == null) {
                    rowsContainer.appendChild(draggingRow);
                } else {
                    rowsContainer.insertBefore(draggingRow, afterElement);
                }
            }
        });

        row.addEventListener('drop', (e) => {
            e.preventDefault();
        });

        row.append(dragHandle, contestContainer, a, d, removeBtn);
        document.getElementById("rows").append(row);
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.row:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function saveToLocalStorage() {
        const entries = [];
        document.querySelectorAll('.row').forEach(row => {
            const contestInput = row.querySelector('.contest-input');
            const awardSelect = row.querySelector('.award');
            const dateInput = row.querySelector('.date');

            const contest = contestInput ? contestInput.value.trim() : '';
            const award = awardSelect ? awardSelect.value : '';
            const date = dateInput ? dateInput.value : '';

            if (contest || award || date) {
                entries.push({ contest, award, date });
            }
        });

        localStorage.setItem('ijhs-calculator-entries', JSON.stringify(entries));
    }

    function loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('ijhs-calculator-entries');
            if (saved) {
                const entries = JSON.parse(saved);
                document.getElementById('rows').innerHTML = '';

                if (entries.length === 0) {
                    addRow();
                    return;
                }

                entries.forEach(entry => {
                    addRow();
                    const lastRow = document.querySelector('.row:last-child');

                    const contestInput = lastRow.querySelector('.contest-input');
                    const awardSelect = lastRow.querySelector('.award');
                    const dateInput = lastRow.querySelector('.date');

                    if (contestInput && entry.contest) {
                        contestInput.value = entry.contest;
                        const event = new Event('input');
                        contestInput.dispatchEvent(event);

                        setTimeout(() => {
                            if (awardSelect && entry.award && entry.award !== 'Award') {
                                awardSelect.value = entry.award;
                            }
                        }, 100);
                    }

                    if (dateInput && entry.date) {
                        dateInput.value = entry.date;
                    }
                });

                addRow();

                setTimeout(calculateResults, 200);
            } else {
                addRow();
            }
        } catch (error) {
            console.warn('Error loading saved entries:', error);
            addRow();
        }
    }

    function clearLocalStorage() {
        localStorage.removeItem('ijhs-calculator-entries');
    }

    document.getElementById("addRow").onclick = () => {
        addRow();
        saveToLocalStorage();
    };

    document.getElementById("clearAll").onclick = () => {
        if (confirm('Are you sure you want to clear all entries? This cannot be undone.')) {
            clearLocalStorage();
            document.getElementById('rows').innerHTML = '';
            addRow();
            document.getElementById('results').innerHTML = '';
            document.querySelector('.export-buttons').style.display = 'none';
            const validationSummary = document.getElementById('validation-summary');
            validationSummary.style.display = 'none';
        }
    };

    loadFromLocalStorage();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !['input', 'select', 'textarea'].includes(e.target.tagName.toLowerCase())) {
            e.preventDefault();
            addRow();
            saveToLocalStorage();
        }

        if (e.key === 'Escape') {
            const validationSummary = document.getElementById('validation-summary');
            if (validationSummary.style.display !== 'none') {
                validationSummary.style.display = 'none';
                document.querySelectorAll('.row.error').forEach(row => {
                    row.classList.remove('error');
                    const errorMsg = row.querySelector('.error-message');
                    if (errorMsg) errorMsg.remove();
                });
            }
        }
    });

    function calculateResults() {
        const rows = document.querySelectorAll(".row");
        rows.forEach(row => {
            row.classList.remove('error');
            const errorMsg = row.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });

        let indSum = 0, teamSum = 0, paCount = 0, sitSum = 0;
        const entryDetails = [];
        let hasValidEntries = false;

        document.querySelectorAll(".row").forEach((r) => {
            const contestInput = r.querySelector(".contest-input");
            const cn = contestInput ? contestInput.value.trim() : null;
            const aw = r.querySelector(".award").value;
            const dt = r.querySelector(".date").value;

            if (!cn || !aw || aw === "Award" || !dt) return;
            if (!contestData[cn]) return;

            const d = new Date(dt);
            if (d < period.start || d > period.end) return;

            const pts = contestData[cn][aw];
            if (!pts) return;

            hasValidEntries = true;
            indSum += pts.ind;
            teamSum += pts.team;

            entryDetails.push({
                contest: cn,
                award: aw,
                date: dt,
                indSP: pts.ind,
                teamSP: pts.team,
                totalSP: pts.ind + pts.team
            });

            if (
                paexsContests.includes(cn) &&
                (aw === "Gold" || aw === "Perfect Score")
            )
                paCount++;
            if (sitContests.includes(cn)) sitSum += pts.ind;
        });

        if (!hasValidEntries) {
            document.getElementById("results").innerHTML = '';
            document.querySelector('.export-buttons').style.display = 'none';
            return;
        }

        const paBonus = paCount >= 3 ? 3 : paCount >= 2 ? 2 : 0;
        const sitBonus =
            sitSum >= 10
                ? 3
                : sitSum >= 8
                    ? 2
                    : sitSum >= 6
                        ? 1
                        : sitSum >= 5
                            ? 0.5
                            : 0;
        const total = (indSum + teamSum + paBonus + sitBonus).toFixed(2);
        const ok = total >= 4;

        let breakdownHTML = '';
        if (entryDetails.length > 0) {
            breakdownHTML = '<h4>Entry Breakdown:</h4><ul>';
            entryDetails.forEach(entry => {
                const colorClass = entry.totalSP >= 1.5 ? 'high-sp' : entry.totalSP >= 0.5 ? 'medium-sp' : 'low-sp';
                const icon = getContestIcon(entry.contest);
                const tooltipText = `Contest: ${entry.contest}, Award: ${entry.award}, Individual SP: ${entry.indSP}, Team SP: ${entry.teamSP}, Date: ${new Date(entry.date).toLocaleDateString()}`;
                breakdownHTML += `<li class="${colorClass}" title="${tooltipText}">
                    <strong>${icon} ${entry.contest} - ${entry.award}</strong> 
                    (${new Date(entry.date).toLocaleDateString()}): 
                    <span class="sp-value">${entry.totalSP.toFixed(1)} SP</span>
                    ${entry.indSP > 0 ? `(${entry.indSP} ind` : ''}${entry.teamSP > 0 ? `${entry.indSP > 0 ? ' + ' : '('}${entry.teamSP} team)` : entry.indSP > 0 ? ')' : ''}
                </li>`;
            });
            breakdownHTML += '</ul>';
        }

        document.getElementById("results").innerHTML = `
      ${breakdownHTML}
      <div class="summary">
        <p title="Total individual scholarship points earned from all contests">Individual SP: <span class="sp-summary">${indSum.toFixed(2)}</span></p>
        <p title="Total team scholarship points earned from all contests">Team SP: <span class="sp-summary">${teamSum.toFixed(2)}</span></p>
        <p title="Bonus points for achieving Gold/Perfect Score in 2+ PAExS contests (IJMO, VIJSO, IJIO, IJCO, IJAO)">PAExS Bonus: <span class="bonus-value">${paBonus}</span></p>
        <p title="Bonus points based on total individual SP from SIT contests (AMO, SASMO, SIAT, VNJSO, NJIO, NJCO)">SIT Bonus: <span class="bonus-value">${sitBonus}</span></p>
        <h3 title="Total scholarship points needed for IJHS eligibility (minimum 4.0 SP required)">Total SP: <span class="total-sp">${total}</span> 
          ${ok ? '<span style="color:green">✅ You qualify!</span>' : '<span style="color:red">❌ Not yet.</span>'}
        </h3>
      </div>
    `;

        document.querySelector('.export-buttons').style.display = 'flex';
    }

    function validateInputsManual() {
        const errors = [];
        const rows = document.querySelectorAll(".row");
        const entryTracker = new Map();

        rows.forEach(row => {
            row.classList.remove('error');
            const errorMsg = row.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });

        rows.forEach((row, index) => {
            const contestInput = row.querySelector(".contest-input");
            const awardSelect = row.querySelector(".award");
            const dateInput = row.querySelector(".date");

            const contest = contestInput ? contestInput.value.trim() : "";
            const award = awardSelect ? awardSelect.value : "";
            const date = dateInput ? dateInput.value : "";

            const rowErrors = [];
            const hasAnyInput = contest || award || date;

            if (hasAnyInput) {
                if (!contest) {
                    rowErrors.push("Contest is required");
                } else if (!contestData[contest]) {
                    rowErrors.push("Invalid contest name");
                }

                if (!award || award === "Award") {
                    rowErrors.push("Award is required");
                } else if (contest && contestData[contest] && !contestData[contest][award]) {
                    rowErrors.push("Invalid award for this contest");
                }

                if (!date) {
                    rowErrors.push("Date is required");
                } else {
                    const d = new Date(date);
                    if (d < period.start || d > period.end) {
                        rowErrors.push(`Date must be within assessment year (${period.start.toLocaleDateString()} - ${period.end.toLocaleDateString()})`);
                    }
                }

                if (contest && contestData[contest] && award && award !== "Award" && date) {
                    const entryKey = `${contest}|${award}|${date}`;
                    if (entryTracker.has(entryKey)) {
                        rowErrors.push("Duplicate entry (same contest, award, and date)");
                    } else {
                        entryTracker.set(entryKey, true);
                    }
                }

                if (rowErrors.length > 0) {
                    row.classList.add('error');
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = `Row ${index + 1}: ${rowErrors.join(', ')}`;
                    row.appendChild(errorDiv);
                    errors.push(...rowErrors.map(err => `Row ${index + 1}: ${err}`));
                }
            }
        });

        const validationSummary = document.getElementById('validation-summary');
        if (errors.length > 0) {
            const errorList = errors.map(err => `<li>${err}</li>`).join('');
            validationSummary.innerHTML = `
                <h4>Please fix the following errors:</h4>
                <ul>${errorList}</ul>
            `;
            validationSummary.style.display = 'block';
            return false;
        } else {
            validationSummary.style.display = 'none';
            return true;
        }
    }

    document.getElementById("calculate").onclick = () => {
        if (!validateInputsManual()) {
            return;
        }
        calculateResults();
    };

    function exportToPDF() {
        const resultsElement = document.getElementById('results');
        if (!resultsElement.innerHTML.trim()) {
            alert('Please calculate results first before exporting.');
            return;
        }

        const printWindow = window.open('', '_blank');
        const assessmentYear = document.getElementById('yearDisplay').textContent;
        const period = document.getElementById('period').textContent;

        const entries = [];
        document.querySelectorAll('.row').forEach(row => {
            const contestInput = row.querySelector('.contest-input');
            const awardSelect = row.querySelector('.award');
            const dateInput = row.querySelector('.date');

            const contest = contestInput ? contestInput.value.trim() : '';
            const award = awardSelect ? awardSelect.value : '';
            const date = dateInput ? dateInput.value : '';

            if (contest && award && award !== 'Award' && date) {
                const icon = getContestIcon(contest);
                entries.push({
                    contest: `${icon} ${contest}`,
                    award,
                    date: new Date(date).toLocaleDateString()
                });
            }
        });

        const entriesHTML = entries.length > 0 ? `
            <h3>Contest Entries:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Contest</th>
                        <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Award</th>
                        <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${entries.map(entry => `
                        <tr>
                            <td style="border: 1px solid #ccc; padding: 8px;">${entry.contest}</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">${entry.award}</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">${entry.date}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '';

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>IJHS SP Calculator Results - ${assessmentYear}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #002a42; padding-bottom: 10px; }
                    .results { background: #f9f9f9; padding: 20px; border-radius: 8px; }
                    .high-sp { color: #28a745; font-weight: bold; }
                    .medium-sp { color: #fd7e14; font-weight: bold; }
                    .low-sp { color: #dc3545; }
                    .sp-summary { font-weight: bold; color: #002a42; }
                    .bonus-value { font-weight: bold; color: #f2b202; }
                    .total-sp { font-weight: bold; color: #002a42; font-size: 1.2rem; }
                    ul { list-style-type: none; padding-left: 0; }
                    li { margin-bottom: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px; }
                    table { border-collapse: collapse; width: 100%; }
                    .footer { margin-top: 30px; text-align: center; font-size: 0.9rem; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>IJHS SP Calculator Results</h1>
                    <p><strong>Assessment Year:</strong> ${assessmentYear} (${period})</p>
                    <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                </div>
                
                ${entriesHTML}
                
                <div class="results">
                    ${resultsElement.innerHTML}
                </div>
                
                <div class="footer">
                    <p>This report was generated by the IJHS SP Calculator</p>
                    <p><em>Important: IJHS Scholarship Points do not accumulate across years. Students must earn the required points within a single Assessment Year.</em></p>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    function generateShareableLink() {
        const resultsElement = document.getElementById('results');
        if (!resultsElement.innerHTML.trim()) {
            alert('Please calculate results first before generating a shareable link.');
            return;
        }

        const entries = [];
        document.querySelectorAll('.row').forEach(row => {
            const contestInput = row.querySelector('.contest-input');
            const awardSelect = row.querySelector('.award');
            const dateInput = row.querySelector('.date');

            const contest = contestInput ? contestInput.value.trim() : '';
            const award = awardSelect ? awardSelect.value : '';
            const date = dateInput ? dateInput.value : '';

            if (contest && award && award !== 'Award' && date) {
                entries.push({ contest, award, date });
            }
        });

        if (entries.length === 0) {
            alert('No valid entries found to share.');
            return;
        }

        const encodedData = btoa(JSON.stringify(entries));
        const shareableUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;

        navigator.clipboard.writeText(shareableUrl).then(() => {
            const originalText = document.getElementById('shareLink').textContent;
            document.getElementById('shareLink').textContent = '✅ Link Copied!';
            setTimeout(() => {
                document.getElementById('shareLink').textContent = originalText;
            }, 2000);
        }).catch(() => {
            prompt('Copy this shareable link:', shareableUrl);
        });
    }

    function loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');

        if (encodedData) {
            try {
                const entries = JSON.parse(atob(encodedData));
                document.getElementById('rows').innerHTML = '';

                entries.forEach(entry => {
                    addRow();
                    const lastRow = document.querySelector('.row:last-child');

                    const contestInput = lastRow.querySelector('.contest-input');
                    const awardSelect = lastRow.querySelector('.award');
                    const dateInput = lastRow.querySelector('.date');

                    if (contestInput && entry.contest) {
                        contestInput.value = entry.contest;
                        const event = new Event('input');
                        contestInput.dispatchEvent(event);

                        setTimeout(() => {
                            if (awardSelect && entry.award) {
                                awardSelect.value = entry.award;
                            }
                        }, 100);
                    }

                    if (dateInput && entry.date) {
                        dateInput.value = entry.date;
                    }
                });

                addRow();

                setTimeout(() => {
                    alert('Contest entries loaded from shared link!');
                    calculateResults();
                }, 500);

            } catch (error) {
                console.warn('Error loading data from URL:', error);
            }
        }
    }

    document.getElementById("exportPDF").onclick = exportToPDF;
    document.getElementById("shareLink").onclick = generateShareableLink;

    function initMobileFeatures() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            window.innerWidth <= 768;

        if (isMobile) {
            function addHapticFeedback(element, intensity = 'light') {
                element.addEventListener('touchstart', () => {
                    if (navigator.vibrate) {
                        navigator.vibrate(intensity === 'light' ? 10 : 20);
                    }
                });
            }

            document.querySelectorAll('button, .contest-suggestion, .drag-handle').forEach(element => {
                addHapticFeedback(element);
            });

            document.addEventListener('touchend', (e) => {
                if (e.target.classList.contains('contest-suggestion')) {
                    e.preventDefault();
                    e.target.click();
                }
            });

            document.body.addEventListener('touchmove', (e) => {
                if (e.target === document.body) {
                    e.preventDefault();
                }
            }, { passive: false });

            let touchStartY = 0;
            document.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            }, { passive: true });

            document.addEventListener('touchmove', (e) => {
                const touchY = e.touches[0].clientY;
                const touchDiff = touchY - touchStartY;
                if (touchDiff > 0 && window.scrollY === 0) {
                    e.preventDefault();
                }
            }, { passive: false });
        }

        document.addEventListener('focusin', (e) => {
            if (isMobile && e.target.matches('input, select, textarea')) {
                setTimeout(() => {
                    e.target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                }, 300);
            }
        });

        if (isMobile) {
            document.body.style.webkitOverflowScrolling = 'touch';
        }
    }

    function showSwipeHint() {
        if (!localStorage.getItem('swipeHintShown')) {
            setTimeout(() => {
                const hint = document.createElement('div');
                hint.className = 'swipe-hint';
                hint.innerHTML = '👈 Tip: Swipe left on any row to delete it';
                hint.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #002A42;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    z-index: 1000;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    animation: slideInDown 0.5s ease-out;
                `;

                document.body.appendChild(hint);

                setTimeout(() => {
                    hint.style.animation = 'slideOutUp 0.5s ease-in forwards';
                    setTimeout(() => hint.remove(), 500);
                }, 4000);

                localStorage.setItem('swipeHintShown', 'true');
            }, 1000);
        }
    }

    initMobileFeatures();
    showSwipeHint();

    const originalAddRow = addRow;
    addRow = function () {
        const result = originalAddRow.apply(this, arguments);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            window.innerWidth <= 768;

        if (isMobile) {
            const lastRow = document.querySelector('.row:last-child');
            if (lastRow) {
                const interactiveElements = lastRow.querySelectorAll('button, input, select, .drag-handle');
                interactiveElements.forEach(element => {
                    element.addEventListener('touchstart', () => {
                        if (navigator.vibrate) {
                            navigator.vibrate(10);
                        }
                    });
                });
            }
        }

        return result;
    };

    setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('data')) {
            loadFromURL();
        }
    }, 100);
});
