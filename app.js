(() => {
    const cfg = window.APP_CONFIG || {};
    const $ = (id) => document.getElementById(id);

    let totalFetched = 0;

    const state = {
        company: "deed",
        type: "MOST_RECENT",
        skip: 0,
        first: 10,
        lastWasEmpty: false,
    };

    function setLoading(loading, message = "") {
        const btns = [$("submitBtn"), $("nextBtn")];
        btns.forEach(b => b.disabled = loading ? true : b.id === "nextBtn" ? $("nextBtn").disabled : false);
        $("status").textContent = message;
    }

    function readInputs(resetPaging) {
        state.company = $("company").value.trim();
        state.type = Array.from($("type").selectedOptions).map(o => o.value).toString();
        state.skip = parseInt($("skip").value || "0", 10);
        state.first = parseInt($("first").value || "10", 10);

        if (resetPaging) {
            state.skip = 0;
            state.first = parseInt($("first").value || "10", 10);
            $("skip").value = String(state.skip);
            $("first").value = String(state.first);
            totalFetched = 0;
            $("totalFetched").textContent = "0";
            $("lastEmpty").textContent = "false";
            $("linkList").innerHTML = "";
        }
    }

    async function fetchEdges({ company, type, skip, first }) {


        let v = {
            "orderBy": "MOST_RECENT", "keywords": company.split(",").map(aa => aa.trim()), "tagSlugs": type.split(",").map(aa => aa.trim()), "skip": skip, "first": first
        }
        console.log("Variables", v);
        const nr = await fetch("https://lokesh-lc.lokeshsekar005.workers.dev/api?a=1", {
            headers: {
                accept: "application/json"
            },
            method: "POST",
            body: JSON.stringify(v)
        });
        let data = await nr.json();

        if (!nr.ok) {
            const t = await nr.text().catch(() => "");
            throw new Error(`HTTP ${nr.status}: ${t || nr.statusText}`);
        }

        const edges = data?.data?.ugcArticleDiscussionArticles?.edges || [];
        const pageInfo = data?.data?.ugcArticleDiscussionArticles?.pageInfo || {};
        const totalNum = data?.data?.ugcArticleDiscussionArticles?.totalNum ?? null;

        return { edges, pageInfo, totalNum, raw: data };
    }

    function renderLinks(topicIds) {
        const container = $("linkList");
        container.innerHTML = ""; // Clear previous links
    }


    function openLinks(topicIds) {
        // Must be inside user-triggered handler for best popup compatibility.
        for (let i = 0; i < topicIds.length; i++) {
            const url = cfg.buildLink(topicIds[i]);
            // small stagger helps some popup blockers
            setTimeout(() => window.open(url, "_blank"), i * 200);
        }
    }

    async function doFetchPage({ reset = false } = {}) {
        try {
            setLoading(true, "Fetching…");
            readInputs(reset);

            // if (!state.company) {
            //     setLoading(false, "Enter company.");
            //     return;
            // }

            const { edges, pageInfo, totalNum } = await fetchEdges(state);
            const ids = edges.map((e) => e?.node?.topicId).filter(Boolean);

            $("fetchedCount").textContent = String(ids.length);
            totalFetched += ids.length;
            $("totalFetched").textContent = String(totalFetched);

            const isEmpty = ids.length === 0;
            state.lastWasEmpty = isEmpty;
            $("lastEmpty").textContent = String(isEmpty);

            // enable/disable Next
            $("nextBtn").disabled = isEmpty;

            if (totalNum !== null) {
                $("status").textContent = `Fetched ${ids.length} (totalNum: ${totalNum}) | skip=${state.skip}, first=${state.first}`;
            } else {
                $("status").textContent = `Fetched ${ids.length} | skip=${state.skip}, first=${state.first}`;
            }

            if (ids.length > 0) {
                renderLinks(ids);
                if ($("autoOpen").checked) {
                    openLinks(ids);
                }
            }
        } catch (err) {
            console.error(err);
            $("status").textContent = `Error: ${err.message}`;
        } finally {
            setLoading(false);
        }
    }

    function nextPage() {
        // increment skip by current first (classic forward pagination)
        state.skip += state.first;
        $("skip").value = String(state.skip);
        doFetchPage({ reset: false });
    }

    // Wire up UI
    window.addEventListener("DOMContentLoaded", () => {
        $("submitBtn").addEventListener("click", () => doFetchPage({ reset: true }));
        $("nextBtn").addEventListener("click", nextPage);
    });
})();
