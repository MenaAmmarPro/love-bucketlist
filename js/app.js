"use strict";

/*
 * love-bucketlist — page logic.
 *
 * A shared list of things we want to do together — big trips and tiny things
 * alike. Tick them off as they happen; progress is stored on this device.
 */

(function () {
  var STORE = "mena-bucketlist";

  var CATS = ["places", "food", "together", "small"];

  var STARTER = [
    { id: "i1", title: "Sleep under the stars with no city lights", cat: "places", done: false },
    { id: "i2", title: "See the sea from a train window", cat: "places", done: false },
    { id: "i3", title: "Make pizza from scratch, badly, together", cat: "food", done: true },
    { id: "i4", title: "Find the best biryani in Bucharest", cat: "food", done: false },
    { id: "i5", title: "Win a Free Fire match as a duo", cat: "together", done: true },
    { id: "i6", title: "Dance in the kitchen with nothing playing", cat: "together", done: false },
    { id: "i7", title: "Send each other a letter for no reason", cat: "small", done: false },
    { id: "i8", title: "Learn one word a day in each other's language", cat: "small", done: false }
  ];

  var state = { items: [], filter: "all" };

  /* ---------------- storage ---------------- */

  function load() {
    state.items = [];
    var raw = null;
    try { raw = localStorage.getItem(STORE); } catch (e) { raw = null; }
    var s = null;
    if (raw) { try { s = JSON.parse(raw); } catch (e) { s = null; } }
    if (s && Array.isArray(s.items) && s.items.length) {
      s.items.forEach(function (it) {
        if (it && typeof it.id === "string" && typeof it.title === "string") {
          state.items.push({
            id: it.id,
            title: it.title.slice(0, 160),
            cat: CATS.indexOf(it.cat) >= 0 ? it.cat : "together",
            done: !!it.done
          });
        }
      });
    } else {
      state.items = STARTER.map(function (i) { return { id: i.id, title: i.title, cat: i.cat, done: i.done }; });
    }
  }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify({ items: state.items })); } catch (e) { /* ignore */ }
  }

  /* ---------------- helpers ---------------- */

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  function note(msg) { setText("save-note", msg); }

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function find(id) {
    for (var i = 0; i < state.items.length; i += 1) {
      if (state.items[i].id === id) return state.items[i];
    }
    return null;
  }

  function nextId() {
    var max = 0;
    state.items.forEach(function (i) {
      var n = parseInt(String(i.id).replace(/\D/g, ""), 10);
      if (n > max) max = n;
    });
    return "i" + (max + 1);
  }

  function visible() {
    if (state.filter === "all") return state.items.slice();
    return state.items.filter(function (i) { return i.cat === state.filter; });
  }

  /* ---------------- actions ---------------- */

  function toggle(id) {
    var it = find(id);
    if (!it) return false;
    it.done = !it.done;
    save();
    render();
    return true;
  }

  function addItem(title, cat) {
    title = String(title || "").trim();
    if (!title) return false;
    state.items.push({
      id: nextId(),
      title: title.slice(0, 160),
      cat: CATS.indexOf(cat) >= 0 ? cat : "together",
      done: false
    });
    save();
    render();
    return true;
  }

  function removeItem(id) {
    for (var i = 0; i < state.items.length; i += 1) {
      if (state.items[i].id === id) {
        var title = state.items[i].title;
        state.items.splice(i, 1);
        save();
        render();
        note("\u201c" + title + "\u201d came off the list.");
        return true;
      }
    }
    return false;
  }

  function setFilter(cat) {
    state.filter = cat === "all" || CATS.indexOf(cat) >= 0 ? cat : "all";
    render();
  }

  function resetList() {
    state.items = STARTER.map(function (i) { return { id: i.id, title: i.title, cat: i.cat, done: i.done }; });
    state.filter = "all";
    save();
    render();
    note("Back to the original list \u2665");
  }

  /* ---------------- rendering ---------------- */

  function renderItem(it) {
    var row = el("div", "item" + (it.done ? " is-done" : ""));
    row.setAttribute("data-id", it.id);

    var check = el("button", "item-check");
    check.type = "button";
    check.setAttribute("aria-label", (it.done ? "Un-tick " : "Tick off ") + it.title);
    check.textContent = it.done ? "\u2713" : "";
    check.addEventListener("click", function () { toggle(it.id); });
    row.appendChild(check);

    var body = el("div", "item-body");
    body.appendChild(el("span", "item-title")).textContent = it.title;
    body.appendChild(el("span", "item-cat")).textContent = it.cat === "small" ? "small things" : it.cat;
    row.appendChild(body);

    var rm = el("button", "item-remove");
    rm.type = "button";
    rm.textContent = "remove";
    rm.addEventListener("click", function () { removeItem(it.id); });
    row.appendChild(rm);

    return row;
  }

  function renderProgress() {
    var total = state.items.length;
    var done = state.items.filter(function (i) { return i.done; }).length;
    var pct = total ? Math.round((done / total) * 100) : 0;

    setText("list-done", done);
    setText("list-total", total);
    setText("list-count", total === 0
      ? "The list is empty \u2014 add the first thing below."
      : (done === total
        ? "Everything on the list is done \u2665"
        : (total - done) + " still waiting"));

    var bar = document.getElementById("list-progress");
    if (bar) bar.style.width = pct + "%";
  }

  function renderFilters() {
    var box = document.getElementById("filters");
    if (!box) return;
    var kids = box.children || [];
    for (var i = 0; i < kids.length; i += 1) {
      var cat = kids[i].getAttribute ? kids[i].getAttribute("data-cat") : null;
      var cls = " " + (kids[i].className || "") + " ";
      if (cat === state.filter) {
        if (cls.indexOf(" is-active ") < 0) kids[i].className = (kids[i].className + " is-active").replace(/^\s+/, "");
      } else {
        kids[i].className = cls.replace(" is-active ", " ").replace(/^\s+|\s+$/g, "");
      }
    }
  }

  function renderList() {
    var list = document.getElementById("item-list");
    if (list) {
      list.textContent = "";
      var items = visible();
      if (!items.length) {
        var empty = el("p", "item-empty");
        empty.textContent = state.filter === "all"
          ? "Nothing on the list yet \u2014 add the first thing below."
          : "Nothing in this category yet.";
        list.appendChild(empty);
      } else {
        items.forEach(function (i) { list.appendChild(renderItem(i)); });
      }
    }
  }

  function render() {
    renderProgress();
    renderFilters();
    renderList();
  }

  /* ---------------- wiring ---------------- */

  function wire() {
    var box = document.getElementById("filters");
    if (box) {
      var kids = box.children || [];
      for (var i = 0; i < kids.length; i += 1) {
        (function (btn) {
          btn.addEventListener("click", function () {
            var cat = btn.getAttribute ? btn.getAttribute("data-cat") : null;
            setFilter(cat);
          });
        })(kids[i]);
      }
    }

    var add = document.getElementById("add-item");
    if (add) add.addEventListener("click", function () {
      var t = document.getElementById("add-title");
      var c = document.getElementById("add-cat");
      if (!t || !String(t.value).trim()) {
        note("Write what we're doing first \u2665");
        return;
      }
      addItem(t.value, c ? c.value : "together");
      if (t) t.value = "";
      note("Added to the list \u2665");
    });

    var reset = document.getElementById("reset-list");
    if (reset) reset.addEventListener("click", resetList);

    var share = document.getElementById("share-button");
    if (share) share.addEventListener("click", function () {
      var url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: document.title, url: url }).catch(function () {});
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { note("Link copied \u2665"); })
          .catch(function () { note(url); });
        return;
      }
      note(url);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    load();
    render();
    wire();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js").catch(function () {});
      });
    }
  });
})();
