(function () {
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function wait(ms) { return new Promise(function (done) { setTimeout(done, calm ? Math.min(ms, 80) : ms); }); }

  // Character clips have see-through backgrounds. Safari plays the .mov version with transparency;
  // other browsers play the .webm version. Anyone who prefers less motion gets a still picture.
  var ua = navigator.userAgent;
  var webkit = /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg\/|OPR\/|Android/.test(ua);
  var ext = webkit ? 'mov' : 'webm';
  function show(el, clip) {
    el.dataset.clip = clip;
    el.textContent = '';
    var still = document.createElement('img');
    still.src = 'assets/' + clip + '.png';
    still.alt = '';
    el.appendChild(still);
    if (calm) return;
    var video = document.createElement('video');
    video.muted = true; video.loop = true; video.playsInline = true; video.autoplay = true;
    video.setAttribute('muted', ''); video.setAttribute('playsinline', ''); video.setAttribute('aria-hidden', 'true');
    video.addEventListener('playing', function () { still.style.visibility = 'hidden'; }, { once: true });
    video.addEventListener('error', function () { video.remove(); });
    video.src = 'assets/' + clip + '.' + ext;
    el.appendChild(video);
    var start = video.play();
    if (start && start.catch) start.catch(function () {});
  }
  document.querySelectorAll('.mascot[data-clip]').forEach(function (el) { show(el, el.dataset.clip); });

  // The phone in the hero plays a screen recording of the app. It plays only while it is on screen.
  var heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    if (calm) { heroVideo.controls = true; }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { var p = heroVideo.play(); if (p && p.catch) p.catch(function () { heroVideo.controls = true; }); }
        else { heroVideo.pause(); }
      }, { threshold: 0.25 }).observe(heroVideo);
    } else { heroVideo.autoplay = true; heroVideo.play(); }
  }

  // (Earlier interactive phone; inactive when its markup is absent.)
  var answers = {
    prep: { steps: [['working', 'Reading your calendar'], ['working', 'Reading the email thread'], ['making', 'Writing your brief']],
      html: '<p><strong>Budget review, 2:00 to 2:45</strong>, Conference Room B, with four people from the budget office.</p><ul><li>They asked last Thursday for the revised travel estimate. You have not replied.</li><li>The draft you shared shows travel 12% over plan.</li><li>Open question from the last meeting: the equipment refresh date.</li></ul><p>I attached the spreadsheet and the thread.</p>' },
    inbox: { steps: [['working', 'Reading your inbox'], ['making', 'Drafting replies']],
      html: '<p>Three messages need you today:</p><ul><li><strong>Approval request</strong> for a new hire, due by 5:00.</li><li><strong>Vendor question</strong> about the renewal date.</li><li><strong>Your director</strong> asked for two slides by tomorrow.</li></ul><p>I drafted a reply to each. Nothing has been sent.</p>' },
    file: { steps: [['working', 'Searching your files'], ['working', 'Comparing versions'], ['making', 'Writing it up']],
      html: '<p>Found <strong>FY27 Staffing Plan</strong>, last edited Tuesday. Since the version before:</p><ul><li>Two analyst positions moved from Q1 to Q3.</li><li>The contractor line went down by one.</li><li>The totals tab now includes benefits.</li></ul><p>Tap the file name to open it on your phone.</p>' }
  };
  var chat = document.getElementById('demoChat');
  var status = document.getElementById('demoStatus');
  var mascot = document.getElementById('demoMascot');
  var chips = document.querySelectorAll('#demoChips button');
  function say(cls, html) {
    var hint = document.getElementById('demoHint');
    if (hint) hint.remove();
    var el = document.createElement('div');
    el.className = cls; el.innerHTML = html;
    chat.appendChild(el); chat.scrollTop = chat.scrollHeight;
  }
  function mood(clip, words) { if (!mascot) return; if (mascot.dataset.clip !== clip) show(mascot, clip); status.textContent = words; }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.disabled = true; });
      var answer = answers[chip.dataset.demo];
      say('me', chip.textContent);
      var chain = Promise.resolve();
      answer.steps.forEach(function (step) { chain = chain.then(function () { mood(step[0], step[1]); return wait(1500); }); });
      chain.then(function () { say('it', answer.html); mood('celebrate', 'Done'); return wait(2600); })
        .then(function () { mood('ready', 'Ready when you are'); chips.forEach(function (c) { c.disabled = false; }); });
    });
  });

  // Animated examples: request, the places it looks, then the result.
  var scenes = {
    prep: { ask: 'Prepare me for my 2:00 budget review.', sources: ['Calendar', 'Mail', 'Files'], title: 'Brief: Budget review, 2:00 to 2:45',
      rows: [['Who', 'Four people from the budget office. Conference Room B.'], ['Since last time', 'They asked for the revised travel estimate on Thursday. No reply from you yet.'], ['Numbers', 'Your draft shows travel 12% over plan.'], ['Open item', 'The equipment refresh date.'], ['Attached', 'FY27 Budget Draft and the email thread.']] },
    inbox: { ask: 'What needs a reply from me today?', sources: ['Mail', 'Teams', 'Calendar'], title: 'Three things need you today',
      rows: [['Approval', 'New hire request, due by 5:00. <span class="tag">Reply drafted</span>'], ['Vendor', 'Question about the renewal date. <span class="tag">Reply drafted</span>'], ['Your director', 'Two slides for tomorrow\'s update. <span class="tag">Outline drafted</span>'], ['Can wait', '14 other messages, mostly notices.']] },
    file: { ask: 'Find the staffing spreadsheet and tell me what changed.', sources: ['OneDrive', 'SharePoint', 'Mail'], title: 'FY27 Staffing Plan, edited Tuesday',
      rows: [['Moved', 'Two analyst positions from Q1 to Q3.'], ['Reduced', 'Contractor line down by one.'], ['Added', 'Benefits are now in the totals tab.'], ['Open it', 'The file opens on your phone from the link in the answer.']] },
    follow: { ask: 'Draft follow-ups from this morning\'s project meeting.', sources: ['Calendar', 'Meeting notes', 'Mail'], title: 'Four action items, three drafts',
      rows: [['To the vendor', 'Confirm the revised delivery date. <span class="tag">Draft ready</span>'], ['To the team', 'Summary and who owns what. <span class="tag">Draft ready</span>'], ['To facilities', 'Room request for the walkthrough. <span class="tag">Draft ready</span>'], ['For you', 'Review the test plan by Friday.'], ['Status', 'Nothing has been sent.']] },
    brief: { ask: 'Every weekday at 7:30, tell me what my day looks like.', sources: ['Scheduled', 'Calendar', 'Mail'], title: 'Today at a glance',
      rows: [['Meetings', 'Five, with a conflict at 11:00.'], ['First up', 'Staff meeting at 9:00. Agenda attached.'], ['Overnight', 'Two messages need a reply this morning.'], ['Due today', 'Timesheet approvals.']] }
  };
  var stage = document.getElementById('stage');
  var askEl = document.getElementById('stAsk');
  var srcEl = document.getElementById('stSources');
  var resEl = document.getElementById('stResult');
  var tabs = document.querySelectorAll('.scene-list button');
  var order = ['prep', 'inbox', 'file', 'follow', 'brief'];
  var run = 0, auto = true, visible = false, started = false;

  function play(name) {
    var mine = ++run, scene = scenes[name];
    var alive = function () { return mine === run; };
    tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.scene === name)); });
    askEl.textContent = ''; srcEl.textContent = ''; resEl.className = 'result'; resEl.textContent = '';
    var chain = Promise.resolve();
    if (calm) { askEl.textContent = scene.ask; }
    else {
      scene.ask.split('').forEach(function (ch, i) {
        chain = chain.then(function () { if (!alive()) return; askEl.innerHTML = scene.ask.slice(0, i + 1).replace(/</g, '&lt;') + '<span class="caret"></span>'; return wait(22); });
      });
      chain = chain.then(function () { if (alive()) askEl.textContent = scene.ask; return wait(350); });
    }
    scene.sources.forEach(function (label) {
      chain = chain.then(function () {
        if (!alive()) return;
        var chip = document.createElement('span'); chip.className = 'src'; chip.innerHTML = '<i></i>' + label; srcEl.appendChild(chip);
        requestAnimationFrame(function () { chip.classList.add('on'); });
        return wait(750).then(function () { chip.classList.add('done'); return wait(200); });
      });
    });
    chain = chain.then(function () {
      if (!alive()) return;
      var title = document.createElement('h4'); title.textContent = scene.title; resEl.appendChild(title); resEl.classList.add('on');
      return wait(250);
    });
    scene.rows.forEach(function (row) {
      chain = chain.then(function () {
        if (!alive()) return;
        var el = document.createElement('div'); el.className = 'row'; el.innerHTML = '<b>' + row[0] + '</b><span>' + row[1] + '</span>'; resEl.appendChild(el);
        requestAnimationFrame(function () { el.classList.add('on'); });
        return wait(380);
      });
    });
    chain.then(function () { return wait(5200); }).then(function () {
      if (alive() && auto && visible && !calm) play(order[(order.indexOf(name) + 1) % order.length]);
    });
  }
  tabs.forEach(function (tab) { tab.addEventListener('click', function () { auto = false; play(tab.dataset.scene); }); });
  if (stage) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !started) { started = true; play('prep'); }
      }, { threshold: 0.3 }).observe(stage);
    } else { play('prep'); }
  }
})();
