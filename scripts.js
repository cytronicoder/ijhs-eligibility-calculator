document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("contests.json");
    const contestData = await response.json();

    const paexsContests = ["IJMO", "VIJSO", "IJIO", "IJCO", "IJAO"];
    const sitContests = ["AMO", "SASMO", "SIAT", "VNJSO", "NJIO", "NJCO"];

    function getAssessmentYear() {
        const now = new Date(), y = now.getFullYear();
        return now.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
    }
    function getPeriod() {
        const now = new Date(), y = now.getFullYear(), m = now.getMonth();
        let start, end;
        if (m >= 7) {
            start = new Date(y, 7, 1);
            end = new Date(y + 1, 6, 31);
        } else {
            start = new Date(y - 1, 7, 1);
            end = new Date(y, 6, 31);
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
        const c = document.createElement("select");
        c.className = "contest";
        c.innerHTML =
            "<option disabled selected>Contest</option>" +
            Object.keys(contestData)
                .map((x) => `<option>${x}</option>`)
                .join("");
        const a = document.createElement("select");
        a.className = "award";
        a.innerHTML = "<option disabled selected>Award</option>";
        const d = document.createElement("input");
        d.className = "date";
        d.type = "date";
        d.min = period.start.toISOString().split("T")[0];
        d.max = period.end.toISOString().split("T")[0];
        c.onchange = () => {
            const opts = Object.keys(contestData[c.value])
                .map((x) => `<option>${x}</option>`)
                .join("");
            a.innerHTML = "<option disabled selected>Award</option>" + opts;
        };
        row.append(c, a, d);
        document.getElementById("rows").append(row);
    }

    document.getElementById("addRow").onclick = addRow;
    addRow();

    document.getElementById("calculate").onclick = () => {
        let indSum = 0, teamSum = 0, paCount = 0, sitSum = 0;
        document.querySelectorAll(".row").forEach((r) => {
            const cn = r.querySelector(".contest").value;
            const aw = r.querySelector(".award").value;
            const dt = r.querySelector(".date").value;
            if (!cn || !aw || !dt) return;
            const d = new Date(dt);
            if (d < period.start || d > period.end) return;
            const pts = contestData[cn][aw];
            indSum += pts.ind;
            teamSum += pts.team;
            if (
                paexsContests.includes(cn) &&
                (aw === "Gold" || aw === "Perfect Score")
            )
                paCount++;
            if (sitContests.includes(cn)) sitSum += pts.ind;
        });
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
        document.getElementById("results").innerHTML = `
      <p>Individual SP: ${indSum.toFixed(2)}</p>
      <p>Team SP: ${teamSum.toFixed(2)}</p>
      <p>PAExS Bonus: ${paBonus}</p>
      <p>SIT Bonus: ${sitBonus}</p>
      <h3>Total SP: ${total} 
        ${ok ? '<span style="color:green">✅ You qualify!</span>' : '<span style="color:red">❌ Not yet.</span>'}
      </h3>
    `;
    };
});
