(() => {
  const dataNode = document.querySelector('#tgc-discovery-data');
  if (!dataNode) return;
  let model;
  try { model = JSON.parse(dataNode.textContent || '{}'); }
  catch (error) { console.warn('Treatment catalogue unavailable', error); return; }
  const treatments = new Map(model.treatments.map(t => [t.slug, t]));
  const concerns = new Map(model.concerns.map(c => [c.slug, c]));
  const tabs = [...document.querySelectorAll('[data-tgc-tab]')];
  const panels = [...document.querySelectorAll('.tgc-discovery-panel')];
  const hashes = {'explore-concerns':'concerns','treatment-list':'list','virtual-consultation':'consult','price-list':'prices'};

  function selectMode(mode, updateHash = true) {
    const tab = tabs.find(t => t.dataset.tgcTab === mode);
    if (!tab) return;
    tabs.forEach(t => {
      const active = t === tab;
      t.classList.toggle('is-selected', active);
      t.setAttribute('aria-expanded', String(active));
    });
    panels.forEach(p => p.hidden = p.id !== 'tgc-panel-' + mode);
    if (updateHash) history.replaceState(history.state, '', '/treatments/#' + tab.dataset.anchor);
  }
  const requestedMode = hashes[location.hash.slice(1)];
  if (requestedMode) selectMode(requestedMode, false);
  tabs.forEach(t => t.addEventListener('click', () => {
    selectMode(t.dataset.tgcTab);
    const panel = document.querySelector('#tgc-panel-' + t.dataset.tgcTab);
    panel?.scrollIntoView({behavior:'smooth',block:'start'});
  }));
  window.addEventListener('hashchange', () => {
    const next = hashes[location.hash.slice(1)];
    if (next) selectMode(next, false);
  });
  function matchesFor(ids) {
    const scores = new Map();
    ids.forEach(id => {
      (concerns.get(id)?.treatmentSlugs || []).forEach(slug => {
        if (treatments.has(slug)) scores.set(slug, (scores.get(slug) || 0) + 1);
      });
    });
    return [...scores].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([slug, score]) => ({treatment:treatments.get(slug),score}));
  }
  function node(tag, className, text) {
    const x = document.createElement(tag);
    if (className) x.className = className;
    if (text) x.textContent = text;
    return x;
  }
  function link(href, label, className) {
    const a = node('a',className,label);
    a.href = href; return a;
  }
  const results = document.querySelector('#selected-concerns-result');
  const count = document.querySelector('#tgc-concern-count');
  const checkboxes = [...document.querySelectorAll('input[name="concern"]')];
  const selectedIds = () => checkboxes.filter(c => c.checked).map(c=>c.value);
  const updateCount = () => {
    const n = selectedIds().length;
    count.textContent = n ? n + ' concern' + (n>1?'s':'') + ' selected' : 'Select the concerns you’d like to explore';
  };
  checkboxes.forEach(c => c.addEventListener('change',updateCount));
  document.querySelector('#view-tgc-selections')?.addEventListener('click', () => {
    const ids = selectedIds();
    results.replaceChildren();
    results.hidden = false;
    if (!ids.length) {
      results.append(node('h3','','Choose a concern to get started'),
        node('p','','Select one or more of the areas above, then we can show you relevant options.'));
      results.focus();
      return;
    }
    results.append(node('p','eyebrow','Understanding your concerns'),
      node('h3','', ids.length===1 ? concerns.get(ids[0]).name : 'A few things worth knowing'));
    for (const id of ids) {
      const c = concerns.get(id);
      if (!c) continue;
      const section=node('div','tgc-match-explainer');
      section.append(node('strong','',c.name),node('p','',c.explainer),
        link('/concerns/'+c.slug+'/','Read more about '+c.name.toLowerCase()+' ↗','tgc-understated-link'));
      results.append(section);
    }
    const matches = matchesFor(ids);
    results.append(node('h3','tgc-match-heading','Treatments worth exploring'));
    if (!matches.length) {
      results.append(node('p','','The full treatment relationships are still being imported. We won’t guess at recommendations. You can browse the catalogue or discuss your concerns during a free consultation.'));
      results.append(link('/treatments/#treatment-list','Browse treatments →','heritage-ghost-button'));
    } else {
      const group=node('div','tgc-match-grid');
      matches.forEach(({treatment,score})=>{
        const card=link('/treatments/'+treatment.slug+'/','','tgc-match-card');
        card.append(node('span','eyebrow','Related treatment'),node('h4','',treatment.name),
          node('p','',treatment.summary),node('span','tgc-understated-link','Read treatment details ↗'));
        group.append(card);
      });
      results.append(group);
      results.append(node('p','tgc-results-disclaimer','These are educational matches from the clinic catalogue, not a personal treatment plan. The right option depends on an individual assessment.'));
    }
    results.scrollIntoView({behavior:'smooth',block:'start'});
    results.focus({preventScroll:true});
  });

  const search = document.querySelector('#tgc-treatment-search');
  const empty = document.querySelector('#tgc-search-empty');
  search?.addEventListener('input', () => {
    const needle = search.value.trim().toLowerCase();
    let visible = 0;
    document.querySelectorAll('[data-tgc-category]').forEach(category => {
      let inside = 0;
      category.querySelectorAll('[data-tgc-treatment-name]').forEach(a=>{
        const yes = a.dataset.tgcTreatmentName.includes(needle);
        a.hidden = !yes;
        if(yes) inside++;
      });
      category.hidden = inside===0;
      visible += inside;
    });
    empty.hidden = visible!==0;
  });

  // First-stage guided consultation: entirely local, no external AI, recording or uploads.
  const chat = document.querySelector('#tgc-consult-chat');
  const input = document.querySelector('#tgc-consult-text');
  const form = document.querySelector('#tgc-consult-form');
  function message(text, speaker) {
    const box=node('div','tgc-chat-message '+(speaker==='visitor'?'is-visitor':'is-assistant'));
    box.append(node('span','tgc-chat-from',speaker==='visitor'?'YOU':'THE GORGEOUS CLINIC'),
      node('p','',text));
    chat.append(box);
    chat.scrollTop = chat.scrollHeight;
    return box;
  }
  function advice(c) {
    message(c.explainer,'assistant');
    const available = matchesFor([c.slug]);
    if(!available.length) {
      message('Our full catalogue links are still being imported, so I won’t guess which treatment would suit this concern. You can explore the educational page for now.','assistant');
    } else {
      message('Here are some treatments from our catalogue you can learn about. These aren’t personalised recommendations.','assistant');
      const box=node('div','tgc-consult-recommendations');
      available.forEach(({treatment}) => {
        const a=link('/treatments/'+treatment.slug+'/','', 'tgc-consult-treatment');
        a.append(node('strong','',treatment.name),node('small','',treatment.summary),
          node('span','','Explore treatment ↗'));
        box.append(a);
      });
      chat.append(box);
    }
    chat.append(link('/concerns/'+c.slug+'/','Learn more about '+c.name.toLowerCase()+' →','tgc-consult-topic-link'));
    chat.scrollTop=chat.scrollHeight;
  }
  document.querySelectorAll('[data-consult-concern]').forEach(b=>{
    b.addEventListener('click',()=>{
      const c=concerns.get(b.dataset.consultConcern);
      if(c){message('I would like to understand '+c.name.toLowerCase()+'.','visitor'); advice(c);}
    });
  });
  const triggers = [
    ['under-eye-concerns', ['under eye','under-eye','dark circle','eye bags','eyebags','puffy eyes','crepey']],
    ['lip-volume',['lip volume','thin lips','my lips','lip fullness','plumper lips']],
    ['lines-and-wrinkles',['wrinkle','fine line','crow feet','crows feet','forehead line','frown line','botox']],
    ['pigmentation',['pigment','dark spot','sun damage','brown spot']],
    ['jowls',['jowl','lower face sag']],
    ['sagging-skin',['sagging skin','loose skin','skin laxity']],
    ['jawline-definition',['jawline','jaw line','double chin definition']],
    ['chin-fullness',['double chin','chin fat','under my chin']],
    ['facial-volume-loss',['gaunt','hollow cheeks','volume loss','hollow face']],
    ['teeth-grinding',['grinding','clenching','masseter','jaw tension']],
    ['lip-lines',['lip line','smoker lines','around my mouth']],
    ['acne-and-breakouts',['acne','spots','breakouts','pimples']]
  ];
  form?.addEventListener('submit',event=>{
    event.preventDefault();
    const text=(input.value||'').trim();
    if(!text) return;
    message(text,'visitor');
    input.value='';
    const lower=text.toLowerCase();
    const found=triggers.find(([slug, keys])=>keys.some(k=>lower.includes(k)));
    const c=found?concerns.get(found[0]):null;
    if(c) advice(c);
    else message('Thank you for explaining. I’m still working with a small set of guided topics. Could you choose the closest concern from the options above? When the full catalogue is imported, we’ll be able to make this conversation much more helpful.','assistant');
  });
})();
