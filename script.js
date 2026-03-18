import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useMemo } from "react";
const CONFIG = {
    moveout: { id: "moveout", title: "🏠 Phase 1", color: "#6366f1", start: "2026-03-18", weeks: 11, salary: 32500, totalGoal: 150000 },
    slayer: { id: "slayer", title: "⚔️ Phase 2", color: "#f43f5e", start: "2026-06-03", weeks: 13, salary: 32500, totalGoal: 300000 },
    harbour: { id: "harbour", title: "🌿 Phase 3", color: "#10b981", start: "2026-09-02", weeks: 18, salary: 32500, totalGoal: 200000 },
    efund: { id: "efund", title: "🛡️ Phase 4", color: "#06b6d4", start: "2027-01-06", weeks: 32, salary: 35000, totalGoal: 700000 },
    wealth: { id: "wealth", title: "💎 Phase 5", color: "#f59e0b", start: "2027-08-18", weeks: 332, salary: 35000, totalGoal: 3000000 },
};
export default function App() {
    const [checked, setChecked] = useState(() => JSON.parse(localStorage.getItem("emp_v20_chk") || "{}"));
    const [customLabels, setCustomLabels] = useState(() => JSON.parse(localStorage.getItem("emp_v20_lab") || "{}"));
    const [customAmts, setCustomAmts] = useState(() => JSON.parse(localStorage.getItem("emp_v20_amt") || "{}"));
    const [accounts, setAccounts] = useState(() => JSON.parse(localStorage.getItem("emp_v20_acc") || JSON.stringify({
        wallet: 0, savings: 0, mp2: 0, reit: 0, debt_paid: 0, fund: 0
    })));
    const [openPhase, setOpenPhase] = useState("moveout");
    const [selectedYear, setSelectedYear] = useState("ALL");
    const [tx, setTx] = useState({ type: 'transfer', from: 'wallet', to: 'savings', amt: '' });
    useEffect(() => {
        localStorage.setItem("emp_v20_chk", JSON.stringify(checked));
        localStorage.setItem("emp_v20_acc", JSON.stringify(accounts));
        localStorage.setItem("emp_v20_lab", JSON.stringify(customLabels));
        localStorage.setItem("emp_v20_amt", JSON.stringify(customAmts));
    }, [checked, accounts, customLabels, customAmts]);
    const executeManual = () => {
        const val = parseFloat(tx.amt);
        if (isNaN(val) || val <= 0)
            return;
        setAccounts(prev => {
            const next = { ...prev };
            if (tx.type === 'expense')
                next[tx.from] -= val;
            else if (tx.type === 'inflow')
                next[tx.from] += val;
            else {
                next[tx.from] -= val;
                next[tx.to] += val;
            }
            return next;
        });
        setTx({ ...tx, amt: '' });
    };
    const handleCheck = (kid, amount, label) => {
        const isChecking = !checked[kid];
        const finalAmt = parseFloat(customAmts[kid] ?? amount);
        const lowLabel = (customLabels[kid] || label).toLowerCase();
        setChecked(prev => ({ ...prev, [kid]: isChecking }));
        setAccounts(prev => {
            const next = { ...prev };
            const isBank = ["loan", "peter", "mp2", "reit", "rent", "insurance", "savings", "debt", "goal", "ef"].some(t => lowLabel.includes(t));
            const source = isBank ? "savings" : "wallet";
            const factor = isChecking ? -1 : 1;
            next[source] += finalAmt * factor;
            const progFactor = isChecking ? 1 : -1;
            if (lowLabel.includes("mp2"))
                next.mp2 += finalAmt * progFactor;
            if (lowLabel.includes("reit"))
                next.reit += finalAmt * progFactor;
            if (lowLabel.includes("loan") || lowLabel.includes("debt"))
                next.debt_paid += finalAmt * progFactor;
            if (lowLabel.includes("fund") || lowLabel.includes("ef"))
                next.fund += finalAmt * progFactor;
            return next;
        });
    };
    const currentProgress = useMemo(() => {
        const p = CONFIG[openPhase];
        let done = 0;
        Object.keys(checked).forEach(kid => { if (kid.startsWith(openPhase) && checked[kid])
            done += parseFloat(customAmts[kid] ?? 0); });
        return { done, pct: Math.min(100, (done / p.totalGoal) * 100) };
    }, [openPhase, checked, customAmts]);
    const timeline = useMemo(() => {
        const p = CONFIG[openPhase];
        const weeksArr = [];
        let curDate = new Date(p.start);
        for (let i = 1; i <= p.weeks; i++) {
            let items = [];
            const cyc = (i - 1) % 4;
            const year = curDate.getFullYear();
            if (openPhase === "moveout") {
                items = [{ n: "Meds & Therapy", c: 3000 }, { n: "Tablet Amort", c: 1000 }, { n: "Ambag", c: 5000 }, { n: "Nominations", c: 0 }];
                if (cyc === 2)
                    items.push({ n: "Bank Loan", c: 9050 }, { n: "St Peter", c: 1800 });
            }
            else {
                items = [{ n: "Food & Gas", c: 5000 }, { n: "Meds & Therapy", c: 3000 }];
                if (openPhase === "wealth") {
                    const wcyc = [{ n: "MP2-1", c: 20000 }, { n: "Insurance/Buffer", c: 20000 }, { n: "REIT-1", c: 20000 }, { n: "Rent", c: 22000 }];
                    items.push(wcyc[cyc]);
                }
                else {
                    const goal = openPhase === "efund" ? 17500 : 15000;
                    items.push({ n: "Phase Goal", c: goal });
                    if (cyc === 0)
                        items.push({ n: "Bank Loan", c: 9050 }, { n: "St Peter", c: 1800 });
                    if (cyc === 1)
                        items.push({ n: "Tirze", c: 5000 }, { n: "Rent", c: openPhase === "efund" ? 22000 : 10000 });
                    if (cyc === 2)
                        items.push({ n: "Insurance", c: 10000 }, { n: "Kuryente", c: 4500 }, { n: "Wifi/Water", c: 3000 });
                }
            }
            if (selectedYear === "ALL" || selectedYear === year.toString()) {
                weeksArr.push({ weekNum: i, date: curDate.toDateString(), year, items, kidBase: `${openPhase}-${i}` });
            }
            curDate.setDate(curDate.getDate() + 7);
        }
        return weeksArr;
    }, [openPhase, selectedYear]);
    const years = useMemo(() => {
        if (openPhase !== "wealth")
            return [];
        return ["ALL", "2027", "2028", "2029", "2030", "2031", "2032", "2033"];
    }, [openPhase]);
    return (_jsxs("div", { style: styles.container, children: [_jsxs("div", { style: { ...styles.progressCard, borderTopColor: CONFIG[openPhase].color }, children: [_jsxs("div", { style: styles.progHeader, children: [_jsx("span", { children: CONFIG[openPhase].title }), _jsxs("span", { children: [currentProgress.pct.toFixed(2), "%"] })] }), _jsx("div", { style: styles.progBarContainer, children: _jsx("div", { style: { ...styles.progBarFill, width: `${currentProgress.pct}%`, backgroundColor: CONFIG[openPhase].color } }) }), _jsxs("div", { style: styles.progStats, children: [_jsxs("span", { children: ["\u20B1", currentProgress.done.toLocaleString()] }), _jsxs("span", { children: ["Target: \u20B1", CONFIG[openPhase].totalGoal.toLocaleString()] })] })] }), _jsx("div", { style: styles.vault, children: Object.entries(accounts).map(([k, v]) => (_jsxs("div", { style: styles.miniCard, children: [_jsx("div", { style: styles.miniLabel, children: k.toUpperCase() }), _jsxs("div", { style: styles.miniVal, children: ["\u20B1", v.toLocaleString()] })] }, k))) }), _jsx("div", { style: styles.commandBox, children: _jsxs("div", { style: styles.commandRow, children: [_jsxs("select", { value: tx.type, onChange: e => setTx({ ...tx, type: e.target.value }), style: styles.select, children: [_jsx("option", { value: "transfer", children: "\uD83D\uDD04 TRF" }), _jsx("option", { value: "expense", children: "\uD83D\uDCB8 EXP" }), _jsx("option", { value: "inflow", children: "\uD83D\uDCB0 GAIN" })] }), _jsx("select", { value: tx.from, onChange: e => setTx({ ...tx, from: e.target.value }), style: styles.select, children: Object.keys(accounts).map(a => _jsx("option", { value: a, children: a.toUpperCase() }, a)) }), tx.type === 'transfer' && (_jsx("select", { value: tx.to, onChange: e => setTx({ ...tx, to: e.target.value }), style: styles.select, children: Object.keys(accounts).map(a => _jsxs("option", { value: a, children: ["TO: ", a.toUpperCase()] }, a)) })), _jsx("input", { type: "number", placeholder: "Amt", value: tx.amt, onChange: e => setTx({ ...tx, amt: e.target.value }), style: styles.inputAmt }), _jsx("button", { onClick: executeManual, style: styles.exeBtn, children: "EXE" })] }) }), _jsx("div", { style: styles.nav, children: Object.keys(CONFIG).map(k => (_jsx("button", { onClick: () => { setOpenPhase(k); setSelectedYear("ALL"); }, style: { ...styles.navBtn, backgroundColor: openPhase === k ? CONFIG[k].color : '#1e293b' }, children: k.toUpperCase() }, k))) }), years.length > 0 && (_jsx("div", { style: styles.yearFilter, children: years.map(y => (_jsx("button", { onClick: () => setSelectedYear(y), style: { ...styles.yearBtn, borderBottom: selectedYear === y ? `2px solid ${CONFIG.wealth.color}` : 'none' }, children: y }, y))) })), _jsx("div", { style: styles.timeline, children: timeline.map(w => (_jsxs("div", { style: { ...styles.weekCard, borderLeftColor: CONFIG[openPhase].color }, children: [_jsxs("div", { style: styles.weekInfo, children: [_jsxs("span", { children: ["W", w.weekNum] }), _jsx("span", { children: w.date })] }), w.items.map((it, ii) => {
                            const kid = `${w.kidBase}-${ii}`;
                            return (_jsxs("div", { style: styles.item, children: [_jsx("input", { type: "checkbox", checked: !!checked[kid], onChange: () => handleCheck(kid, it.c, it.n) }), _jsx("input", { type: "text", value: customLabels[kid] || it.n, onChange: (e) => setCustomLabels(prev => ({ ...prev, [kid]: e.target.value })), style: styles.itemInput }), _jsx("input", { type: "number", value: customAmts[kid] ?? it.c, onChange: (e) => setCustomAmts(prev => ({ ...prev, [kid]: e.target.value })), style: styles.amtInput })] }, kid));
                        })] }, w.kidBase))) })] }));
}
const styles = {
    container: { background: '#020617', minHeight: '100vh', padding: '15px 15px 80px 15px', color: 'white', fontFamily: 'system-ui' },
    progressCard: { background: '#0f172a', padding: '12px', borderRadius: '12px', marginBottom: '10px', borderTop: '4px solid', position: 'sticky', top: '0', zIndex: '10' },
    progHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 'bold', marginBottom: '8px' },
    progBarContainer: { height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' },
    progBarFill: { height: '100%', transition: 'width 0.3s' },
    progStats: { display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#64748b', marginTop: '6px' },
    vault: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '15px' },
    miniCard: { background: '#0f172a', padding: '8px', borderRadius: '8px', border: '1px solid #1e293b' },
    miniLabel: { fontSize: '0.45rem', color: '#94a3b8' },
    miniVal: { fontSize: '0.7rem', fontWeight: 'bold' },
    commandBox: { background: '#1e293b', padding: '10px', borderRadius: '10px', marginBottom: '15px' },
    commandRow: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
    select: { background: '#0f172a', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '0.6rem' },
    inputAmt: { background: '#0f172a', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', width: '55px', fontSize: '0.6rem' },
    exeBtn: { background: '#f59e0b', color: 'black', border: 'none', padding: '6px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.6rem' },
    nav: { display: 'flex', gap: '4px', marginBottom: '10px', overflowX: 'auto', position: 'sticky', top: '85px', zIndex: '9', background: '#020617', padding: '5px 0' },
    navBtn: { flex: 1, border: 'none', padding: '8px', borderRadius: '4px', color: 'white', fontSize: '0.5rem', fontWeight: 'bold', minWidth: '70px' },
    yearFilter: { display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '15px', padding: '5px 0' },
    yearBtn: { background: 'transparent', color: '#94a3b8', border: 'none', fontSize: '0.65rem', padding: '4px 8px', cursor: 'pointer' },
    timeline: { display: 'flex', flexDirection: 'column', gap: '8px' },
    weekCard: { background: '#0f172a', padding: '10px', borderRadius: '8px', borderLeft: '4px solid' },
    weekInfo: { display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', marginBottom: '5px', color: '#94a3b8' },
    item: { display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0' },
    itemInput: { background: 'transparent', border: 'none', color: 'white', flex: 1, fontSize: '0.7rem' },
    amtInput: { background: '#1e293b', border: 'none', color: '#94a3b8', width: '55px', fontSize: '0.65rem', textAlign: 'right' }
};
