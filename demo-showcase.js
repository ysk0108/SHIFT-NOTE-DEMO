(() => {
  'use strict';

  const VERSION = '2026.09.23';
  const SAMPLE_PERIOD = '2026-10-01〜2026-10-15';
  const state = {
    tour: 0,
    handover: 0,
    notification: 'unread',
    manualConfirmed: false,
    weekdayOverride: false
  };

  const featureGroups = [
    {
      title:'クルーが毎日使う機能',
      items:[
        ['skill','👤','Skill Passport','できる仕事・習熟度を人に紐づけて持ち運ぶ','応援・異動のたびに「何ができる人？」から始めなくて済む'],
        ['guide','📍','Store Guide','その店舗だけの保管場所・運用差分を表示','初めての店舗でも「その店だけ違うこと」をすぐ確認'],
        ['handover','↗','引き継ぎ','未確認→確認済み→対応中→完了まで追跡','口頭・LINEで流れていた情報を「誰が見たか」まで残す'],
        ['tasks','✓','今日の業務','業務テンプレートからその日の仕事を表示','新人にも「今日やること」だけを分かりやすく見せる'],
        ['manual','▦','マニュアル / QR','版管理・映像・再確認・QR起動','古い手順を見続けるリスクを減らす'],
        ['report','!','報告 / Help','緊急度別報告と公開・非公開の質問','「分からない」を抱えたままにしない'],
        ['notification','🔔','通知センター','未読・既読・対応済みを分離','読んだだけで消さず、対応が終わるまで残す']
      ]
    },
    {
      title:'シフト機能',
      items:[
        ['shift-request','📅','シフト募集・希望提出','募集期間・締切・日ごとの出勤可能時間を提出','LINE回収や転記作業を減らす'],
        ['weekday','🗓','曜日一括の休み希望','毎週休む曜日を一度でまとめて登録','学生や固定休のクルーが日付ごとに入力しなくていい'],
        ['unavailable','🏫','期間休み','実習・帰省など出勤不可期間をまとめて登録','対象期間は提出・仮組み・未提出通知から自動除外'],
        ['lateoff','⏰','締切後の休み申請','締切後は通常提出と分けて店長承認へ','「締切後にLINEで追加」がシステム上で残る'],
        ['reminder','📨','未提出 / 再通知','不足している日だけ判定し、再通知済みも記録','何度も同じ人へ通知するミスを防ぐ'],
        ['draft','⚡','シフト自動仮組み','希望＋必要人数から店長用のたたき台を生成','ゼロから表を作る時間を減らす。最終判断は人'],
        ['shift-edit','✎','仮組み編集・公開','人・日付・開始/終了を編集してから公開','自動作成をそのまま確定せず、店長が最後に調整'],
        ['support','⇄','応援勤務','Skill PassportとStore Guideを店舗移動に連動','応援先でもスキルは持ち運び、店舗差分だけ確認']
      ]
    },
    {
      title:'基盤・安全性',
      items:[
        ['roles','🔐','役職・権限','レギュラー〜本部までサーバー側RLSで制御','画面を隠すだけではなくDB側でも権限判定'],
        ['translation','🌐','多言語','日本語・英語・中国語・韓国語・ベトナム語など','外国人クルーの理解負担を下げる土台'],
        ['pwa','📱','PWA / オフライン','ホーム画面追加・端末通知・オフラインキュー','専用アプリストア配布なしでもスマホ運用しやすい'],
        ['security','🔒','セキュリティ','強いパスワード、RLS、監査、最小権限','実店舗データを扱う前提で段階的に防御を強化']
      ]
    }
  ];

  function css() {
    const s=document.createElement('style');
    s.textContent = `
      .spdemo-fab{position:fixed;right:max(calc((100vw - 430px)/2 + 14px),14px);bottom:82px;z-index:29;border:0;border-radius:999px;background:#101828;color:#fff;padding:11px 15px;font-size:11px;font-weight:900;box-shadow:0 8px 28px #10182838;cursor:pointer}
      .spdemo-pitch{margin:12px 14px 0;border:1px solid #cfd9ff;background:linear-gradient(135deg,#f7f9ff,#eef4ff);border-radius:18px;padding:13px}
      .spdemo-pitch h3{margin:0;font-size:14px}.spdemo-pitch p{font-size:11px;line-height:1.55;color:#526079;margin:5px 0 10px}
      .spdemo-pitch-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}.spdemo-pitch button{border:0;border-radius:11px;padding:9px;font-size:10px;font-weight:900;cursor:pointer}.spdemo-pitch .dark{background:#101828;color:#fff}.spdemo-pitch .light{background:#fff;color:#315fd3;border:1px solid #cfd9ff}
      .spdemo-overlay{display:none;position:fixed;inset:0;z-index:1000;background:#10182885;align-items:flex-end;justify-content:center}.spdemo-overlay.open{display:flex}
      .spdemo-sheet{width:min(560px,100%);max-height:94vh;overflow:auto;background:#f5f7fa;border-radius:26px 26px 0 0;padding:0 14px calc(28px + env(safe-area-inset-bottom));box-shadow:0 -16px 50px #10182828}
      .spdemo-sticky{position:sticky;top:0;z-index:3;background:#f5f7faf2;backdrop-filter:blur(14px);padding:14px 0 10px;border-bottom:1px solid #e4e7ec;display:flex;justify-content:space-between;align-items:center}
      .spdemo-sticky h2{font-size:17px;margin:0}.spdemo-close{width:36px;height:36px;border:0;border-radius:11px;background:#e9edf2;font-size:18px;cursor:pointer}
      .spdemo-hero{background:linear-gradient(135deg,#101828,#263954);color:#fff;border-radius:20px;padding:17px;margin-top:13px}.spdemo-hero h3{font-size:22px;margin:6px 0}.spdemo-hero p{font-size:12px;line-height:1.6;color:#d9e1ec;margin:0}
      .spdemo-badge{display:inline-flex;border-radius:999px;padding:5px 8px;background:#ffffff18;border:1px solid #ffffff22;font-size:9px;font-weight:900}
      .spdemo-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:11px}.spdemo-btn{border:0;border-radius:12px;padding:10px;font-size:11px;font-weight:900;cursor:pointer}.spdemo-btn.primary{background:#101828;color:#fff}.spdemo-btn.blue{background:#edf2ff;color:#315fd3}.spdemo-btn.white{background:#fff;color:#101828}.spdemo-btn.ghost{background:#fff;border:1px solid #d9dee7;color:#475467}.spdemo-btn.red{background:#fff0f0;color:#b42318}
      .spdemo-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:11px}.spdemo-kpi{background:#ffffff10;border:1px solid #ffffff1d;border-radius:12px;padding:9px}.spdemo-kpi strong{display:block;font-size:18px}.spdemo-kpi span{font-size:8px;color:#d6dfeb}
      .spdemo-title{display:flex;align-items:center;justify-content:space-between;margin:18px 2px 8px}.spdemo-title h3{font-size:14px;margin:0}.spdemo-title small{font-size:9px;color:#667085}
      .spdemo-card{background:#fff;border:1px solid #e4e7ec;border-radius:16px;padding:13px;margin-bottom:8px}.spdemo-card.click{cursor:pointer}.spdemo-card .name{font-size:13px;font-weight:900}.spdemo-card .desc{font-size:10px;line-height:1.55;color:#667085;margin-top:4px}.spdemo-card .value{font-size:10px;line-height:1.5;color:#315fd3;margin-top:7px;font-weight:800}.spdemo-row{display:flex;gap:9px;align-items:flex-start}.spdemo-icon{width:34px;height:34px;border-radius:11px;background:#eef2ff;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
      .spdemo-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.spdemo-grid .spdemo-card{margin:0}
      .spdemo-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;background:#e9edf2;border-radius:12px;padding:4px;margin:12px 0}.spdemo-tabs button{border:0;background:transparent;border-radius:9px;padding:8px 4px;font-size:9px;font-weight:900;color:#667085}.spdemo-tabs button.on{background:#fff;color:#101828;box-shadow:0 1px 4px #10182812}
      .spdemo-chip{display:inline-flex;border-radius:999px;padding:4px 7px;font-size:8px;font-weight:900;background:#eff2f5;color:#475467;margin:2px}.spdemo-chip.green{background:#e9f7f1;color:#157f5b}.spdemo-chip.red{background:#fff0f0;color:#c43232}.spdemo-chip.blue{background:#edf2ff;color:#315fd3}.spdemo-chip.amber{background:#fff6e8;color:#a65d0b}
      .spdemo-note{border:1px solid #d7e1ff;background:#f4f7ff;border-radius:13px;padding:10px;font-size:10px;line-height:1.55;color:#4b5f8c;margin:8px 0}.spdemo-warn{border:1px solid #ffd9a6;background:#fff8ee;border-radius:13px;padding:10px;font-size:10px;line-height:1.55;color:#8a4b08;margin:8px 0}
      .spdemo-flow{display:flex;gap:4px;flex-wrap:wrap;margin:9px 0}.spdemo-flow span{border:1px solid #d9dee7;background:#fff;border-radius:999px;padding:5px 7px;font-size:8px;font-weight:900;color:#98a2b3}.spdemo-flow span.on{background:#101828;color:#fff;border-color:#101828}
      .spdemo-rule{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid #eef1f4;font-size:10px}.spdemo-rule:last-child{border-bottom:0}.spdemo-rule b{font-size:10px}
      .spdemo-checks{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin:9px 0}.spdemo-checks label{background:#fff;border:1px solid #dfe4eb;border-radius:10px;padding:8px 2px;text-align:center;font-size:9px;font-weight:900}.spdemo-checks input{display:block;margin:0 auto 4px}
      .spdemo-timeline-wrap{overflow:auto;border:1px solid #e4e7ec;border-radius:13px;background:#fff}.spdemo-timeline{min-width:790px;padding:10px}.spdemo-hours{margin-left:90px;display:grid;grid-template-columns:repeat(24,30px);font-size:7px;color:#667085}.spdemo-tlrow{height:42px;display:flex;align-items:center}.spdemo-person{width:90px;flex:0 0 90px;font-size:9px;font-weight:900}.spdemo-track{width:720px;height:32px;position:relative;background:repeating-linear-gradient(90deg,#fff 0,#fff 29px,#eef1f4 29px,#eef1f4 30px);border-bottom:1px solid #f0f2f5}.spdemo-bar{position:absolute;top:5px;height:22px;border-radius:7px;background:#e8eefc;border:1px solid #bfd0fa;color:#284fae;font-size:8px;font-weight:900;padding:5px 7px;white-space:nowrap;overflow:hidden}.spdemo-bar.warn{background:#fff1dd;border-color:#ffc675;color:#8a4b08}
      .spdemo-tree{padding-left:8px}.spdemo-tree div{font-size:10px;line-height:1.9}.spdemo-tree .l1{padding-left:16px}.spdemo-tree .l2{padding-left:32px}.spdemo-tree .l3{padding-left:48px}.spdemo-tree .l4{padding-left:64px}
      .spdemo-tour-nav{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.spdemo-progress{height:5px;background:#e7ebf0;border-radius:99px;overflow:hidden;margin:8px 0 13px}.spdemo-progress i{display:block;height:100%;background:#315fd3;border-radius:99px}
      .spdemo-input{width:100%;border:1px solid #d9dee7;border-radius:11px;background:#fff;padding:9px;font-size:10px;margin-top:6px}
      .spdemo-stat{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #eef1f4}.spdemo-stat:last-child{border-bottom:0}.spdemo-stat strong{font-size:11px}.spdemo-stat span{font-size:9px;color:#667085}
      @media(max-width:360px){.spdemo-grid{grid-template-columns:1fr}.spdemo-checks{grid-template-columns:repeat(4,1fr)}}
    `;
    document.head.appendChild(s);
  }

  function ensureOverlay(){
    if(document.getElementById('spdemoOverlay')) return;
    const o=document.createElement('div');
    o.id='spdemoOverlay';
    o.className='spdemo-overlay';
    o.innerHTML='<div class="spdemo-sheet"><div class="spdemo-sticky"><div><h2>SKILL PASSPORT</h2><div style="font-size:9px;color:#667085">最新統合デモ '+VERSION+' ・ すべて架空データ</div></div><button class="spdemo-close" onclick="SPDemo.close()">×</button></div><div id="spdemoBody"></div></div>';
    o.addEventListener('click',function(e){ if(e.target===o) close(); });
    document.body.appendChild(o);
  }

  function open(){
    ensureOverlay();
    document.getElementById('spdemoOverlay').classList.add('open');
    overview();
  }

  function close(){
    const o=document.getElementById('spdemoOverlay');
    if(o) o.classList.remove('open');
  }

  function setBody(html){
    ensureOverlay();
    document.getElementById('spdemoBody').innerHTML=html;
    document.querySelector('.spdemo-sheet').scrollTop=0;
  }

  function overview(){
    let html='<div class="spdemo-hero"><span class="spdemo-badge">上司・企業向けプレゼンモード</span><h3>人が変わっても、店が変わっても、仕事の情報が途切れない。</h3><p>Skill Passport・店舗知識・シフト・マニュアル・引き継ぎを一つにつなぐ店舗オペレーション基盤。</p><div class="spdemo-kpis"><div class="spdemo-kpi"><strong>19</strong><span>主要機能をデモ化</span></div><div class="spdemo-kpi"><strong>2</strong><span>クルー / 店長</span></div><div class="spdemo-kpi"><strong>1</strong><span>一つの業務基盤</span></div></div><div class="spdemo-actions"><button class="spdemo-btn white" onclick="SPDemo.tour(0)">▶ 60秒で見る</button><button class="spdemo-btn blue" onclick="SPDemo.scrollFeatures()">全機能を見る</button></div></div>';
    html+='<div class="spdemo-note"><b>デモの見方</b><br>実装済みの運用フローを架空データで再現しています。Web Push本番配信、自由記述の自動翻訳、労務・会社ルールを含む高度なシフト最適化は今後強化する領域です。</div><div class="spdemo-title"><h3>役職ごとに見る価値</h3><small>同じデータを違う視点で利用</small></div><div class="spdemo-tabs"><button class="on" onclick="SPDemo.persona(this,\'crew\')">クルー</button><button onclick="SPDemo.persona(this,\'manager\')">店長</button><button onclick="SPDemo.persona(this,\'hq\')">本部</button></div><div id="spdemoPersona">'+personaHtml('crew')+'</div>';
    html+='<div id="spdemoFeatureStart"></div>';
    featureGroups.forEach(function(group){
      html+='<div class="spdemo-title"><h3>'+group.title+'</h3><small>'+group.items.length+'機能</small></div>';
      group.items.forEach(function(x){
        html+='<div class="spdemo-card click" onclick="SPDemo.detail(\''+x[0]+'\')"><div class="spdemo-row"><div class="spdemo-icon">'+x[1]+'</div><div><div class="name">'+x[2]+'</div><div class="desc">'+x[3]+'</div><div class="value">企業価値：'+x[4]+' →</div></div></div></div>';
      });
    });
    setBody(html);
  }

  function personaHtml(kind){
    const map={
      crew:'<div class="spdemo-card"><div class="name">クルーの1日</div><div class="desc">ホームで重要事項 → 今日の業務 → 分からなければHelp → シフト希望提出。初めての店舗ではStore Guideだけ確認。</div><div class="value">入力を増やすのではなく「迷う・聞く・探す」を減らす。</div></div>',
      manager:'<div class="spdemo-card"><div class="name">店長の1日</div><div class="desc">未確認引き継ぎ → 未提出者 → シフト仮組み → 警告を見て微調整 → 公開。締切後申請も履歴で処理。</div><div class="value">LINE・紙・Excelに分散している確認作業を一つにまとめる。</div></div>',
      hq:'<div class="spdemo-card"><div class="name">本部の視点</div><div class="desc">全国階層で店舗を束ね、共通マニュアルと通知を配信。店舗固有情報はStore Guideとして残す。</div><div class="value">全国統一と現場差分を同じ仕組みで両立する。</div></div>'
    };
    return map[kind]||map.crew;
  }

  function persona(btn,kind){
    const tabs=btn.parentElement.querySelectorAll('button');
    tabs.forEach(function(x){x.classList.remove('on');});
    btn.classList.add('on');
    document.getElementById('spdemoPersona').innerHTML=personaHtml(kind);
  }

  function scrollFeatures(){
    const el=document.getElementById('spdemoFeatureStart');
    if(el) el.scrollIntoView({behavior:'smooth'});
  }

  const tourSlides=[
    ['1 / 8','現場の課題から始める','LINE、紙、口頭、Excel。情報があるのに「伝わらない・分からない・確認されない」が起きる。','<div class="spdemo-card"><div class="spdemo-stat"><strong>シフト希望</strong><span>LINEで回収</span></div><div class="spdemo-stat"><strong>店舗固有ルール</strong><span>知っている人に聞く</span></div><div class="spdemo-stat"><strong>習熟度</strong><span>店ごとに把握</span></div><div class="spdemo-stat"><strong>引き継ぎ</strong><span>既読が不明</span></div></div>'],
    ['2 / 8','Skill Passport','「この人が何をできるか」を店舗ではなく人に紐づける。','<div class="spdemo-card"><div class="spdemo-stat"><strong>レジ接客</strong><span class="spdemo-chip green">単独対応可</span></div><div class="spdemo-stat"><strong>公共料金受付</strong><span class="spdemo-chip green">実施経験あり</span></div><div class="spdemo-stat"><strong>発注</strong><span class="spdemo-chip amber">未習得</span></div></div><div class="spdemo-note">駅前店へ応援に行ってもSkill Passportはそのまま。店ごとの差だけStore Guideで確認。</div>'],
    ['3 / 8','シフト希望をラクに集める','日ごとの希望に加え、「毎週火・木は休み」を一括登録。実習・帰省は期間休みにする。','<div class="spdemo-checks"><label><input type="checkbox">月</label><label><input type="checkbox" checked>火</label><label><input type="checkbox">水</label><label><input type="checkbox" checked>木</label><label><input type="checkbox">金</label><label><input type="checkbox">土</label><label><input type="checkbox">日</label></div><div class="spdemo-chip red">火曜 2日を休み</div><div class="spdemo-chip red">木曜 2日を休み</div>'],
    ['4 / 8','希望からシフトを仮組み','必要人数と集まった希望から、店長が直せる「たたき台」を自動生成する。','__TIMELINE__'],
    ['5 / 8','スキルは「警告」に使う','スキル不足を理由に自動配置を禁止しない。配置はできるが、店長には誰が何を不足しているかを見せる。','<div class="spdemo-warn">⚠ サンプルB：フライヤー油管理が未習得</div><div class="spdemo-note">最終判断を人に残すことで、現場を止めない。</div>'],
    ['6 / 8','引き継ぎは「見た」だけで終わらせない','未確認 → 確認済み → 対応中 → 完了。誰がどこまで対応したかを残す。','<div class="spdemo-flow"><span class="on">未確認</span><span class="on">確認済み</span><span class="on">対応中</span><span class="on">完了</span></div><div class="spdemo-card"><div class="name">冷凍ケース右側の温度が高め</div><div class="desc">確認 4/5名 ・ 店長が未確認者を把握</div></div>'],
    ['7 / 8','店舗運用を一つにつなぐ','全国 → エリア → 県 → ブロック → 店舗。店舗内の運用に集中して見せる。','<div class="spdemo-card"><div class="name">店舗運用モード</div><div class="desc">現在のデモでは本部・他店舗管理は非表示。クルーと店長の現場運用に絞っています。</div></div>'],
    ['8 / 8','SKILL PASSPORTが目指すもの','シフトアプリでも、マニュアルアプリでもない。人・店舗・日々の運営を一つにつなぐ。','<div class="spdemo-card"><div class="name">店舗オペレーション基盤</div><div class="desc">Skill Passport × Store Guide × シフト仮組み × マニュアル × 引き継ぎ × 本部管理</div><div class="value">「人が変わっても、店が変わっても、仕事の情報が途切れない。」</div></div>']
  ];

  function tour(n){
    state.tour=Math.max(0,Math.min(tourSlides.length-1,n));
    const s=tourSlides[state.tour];
    const detail=s[3].replace('__TIMELINE__',timeline());
    let html='<div class="spdemo-title"><h3>60秒デモ</h3><small>'+s[0]+'</small></div><div class="spdemo-progress"><i style="width:'+(((state.tour+1)/tourSlides.length)*100)+'%"></i></div><div class="spdemo-hero"><span class="spdemo-badge">'+s[0]+'</span><h3>'+s[1]+'</h3><p>'+s[2]+'</p></div><div style="margin-top:11px">'+detail+'</div><div class="spdemo-tour-nav"><button class="spdemo-btn ghost" '+(state.tour===0?'disabled':'')+' onclick="SPDemo.tour('+(state.tour-1)+')">← 前へ</button>'+(state.tour===tourSlides.length-1?'<button class="spdemo-btn primary" onclick="SPDemo.overview()">全機能を見る</button>':'<button class="spdemo-btn primary" onclick="SPDemo.tour('+(state.tour+1)+')">次へ →</button>')+'</div>';
    setBody(html);
  }

  function timeline(){
    const hours=[]; for(let h=6;h<30;h++) hours.push('<span>'+((h%24))+'</span>');
    const rows=[
      ['サンプルA',6,14,false,'06–14'],
      ['サンプルB',9,17,true,'09–17 ⚠'],
      ['サンプルC',14,23,false,'14–23'],
      ['サンプルD',23,30,false,'23–翌06']
    ];
    let out='<div class="spdemo-timeline-wrap"><div class="spdemo-timeline"><div class="spdemo-hours">'+hours.join('')+'</div>';
    rows.forEach(function(r){
      out+='<div class="spdemo-tlrow"><div class="spdemo-person">'+r[0]+'</div><div class="spdemo-track"><div class="spdemo-bar '+(r[3]?'warn':'')+'" style="left:'+((r[1]-6)*30)+'px;width:'+((r[2]-r[1])*30-4)+'px">'+r[4]+'</div></div></div>';
    });
    out+='</div></div><div class="spdemo-warn">⚠ オレンジのバー：配置は可能。ただし必要スキルに注意が必要な人。</div>';
    return out;
  }

  function detail(key){
    if(['national','hq','store-settings','search','ops'].includes(key)){ setBody('<div class="spdemo-title"><h3>現在非表示</h3><small>本部・他店舗管理</small></div><div class="spdemo-card"><div class="name">この機能は現在のデモでは表示していません</div><div class="desc">本部・多店舗向けの基盤は残していますが、今回の説明対象から一旦外しています。</div></div><button class="spdemo-btn ghost" onclick="SPDemo.overview()">← 全機能ガイドへ</button>'); return; }
    const common='<button class="spdemo-btn ghost" onclick="SPDemo.overview()">← 全機能ガイドへ</button>';
    let h='';

    if(key==='skill') h='<div class="spdemo-title"><h3>Skill Passport</h3><small>人に紐づくスキル</small></div><div class="spdemo-card"><div class="spdemo-stat"><strong>レジ接客</strong><span class="spdemo-chip green">単独対応可 100%</span></div><div class="spdemo-stat"><strong>公共料金受付</strong><span class="spdemo-chip green">実施経験あり 80%</span></div><div class="spdemo-stat"><strong>フライヤー油管理</strong><span class="spdemo-chip blue">実施経験あり 60%</span></div><div class="spdemo-stat"><strong>発注</strong><span class="spdemo-chip amber">未習得 20%</span></div></div><div class="spdemo-note">店舗が変わってもこのスキル情報は本人と一緒に移動。応援先では「何ができるか」を一から確認し直さない。</div>';
    else if(key==='guide') h='<div class="spdemo-title"><h3>Store Guide</h3><small>店舗固有情報</small></div><div class="spdemo-card"><div class="name">サンプル駅前店は初めてです</div><div class="desc">Skill Passportはそのまま。違うところだけ確認します。</div></div><div class="spdemo-card"><div class="spdemo-stat"><strong>コピー用紙</strong><span>バックヤード棚B</span></div><div class="spdemo-stat"><strong>清掃用具</strong><span>倉庫右奥</span></div><div class="spdemo-stat"><strong>返品箱</strong><span>事務所入口</span></div></div><div class="spdemo-note">全国共通マニュアルにローカルな保管場所を書き込まず、店舗差分だけ分離して持てる。</div>';
    else if(key==='handover') h=handoverHtml();
    else if(key==='tasks') h='<div class="spdemo-title"><h3>今日の業務</h3><small>テンプレート連動</small></div><div class="spdemo-card"><div class="spdemo-stat"><strong>✓ レジ周辺補充</strong><span class="spdemo-chip green">完了</span></div><div class="spdemo-stat"><strong>○ コピー機用紙確認</strong><span class="spdemo-chip amber">未着手</span></div><div class="spdemo-stat"><strong>○ フライヤー油の状態確認</strong><span class="spdemo-chip blue">対応中</span></div></div><div class="spdemo-note">店長がテンプレートを管理。毎日必要な業務だけをクルーに表示できる。</div>';
    else if(key==='manual') h=manualHtml();
    else if(key==='report') h='<div class="spdemo-title"><h3>報告 / Help</h3><small>「分からない」を残さない</small></div><div class="spdemo-card"><div class="name">異常・事故・設備報告</div><div class="spdemo-flow"><span>低</span><span class="on">通常</span><span>高</span><span>緊急</span></div><div class="desc">緊急度によって通知先を変える。画像添付にも対応。</div></div><div class="spdemo-card"><div class="name">質問 / Help</div><div class="spdemo-flow"><span class="on">公開</span><span>非公開</span></div><div class="desc">店舗内共有にするか、店長以上だけへ送るかを選ぶ。</div></div>';
    else if(key==='notification') h=notificationHtml();
    else if(key==='shift-request') h='<div class="spdemo-title"><h3>シフト募集・希望提出</h3><small>'+SAMPLE_PERIOD+'</small></div><div class="spdemo-card" style="border-color:#f5c27f;background:#fff9f0"><div class="name">シフト希望受付中</div><div class="desc">10/1〜10/15 ・ 締切 9/28 23:59</div><span class="spdemo-chip amber">締切間近</span></div><div class="spdemo-card"><div class="name">10/3（土）</div><div class="desc">出勤可能 17:00〜22:00</div></div><div class="spdemo-card"><div class="name">10/4（日）</div><div class="desc">休み希望</div></div><div class="spdemo-note">募集→希望回収→未提出判定→仮組みまで同じ周期IDでつながる。</div>';
    else if(key==='weekday') h=weekdayHtml();
    else if(key==='unavailable') h='<div class="spdemo-title"><h3>期間休み</h3><small>学生・実習・帰省</small></div><div class="spdemo-card"><div class="name">10/05〜10/09</div><div class="desc">学校の実習期間</div><span class="spdemo-chip blue">提出対象外</span><span class="spdemo-chip blue">仮組み対象外</span><span class="spdemo-chip blue">未提出通知なし</span></div><div class="spdemo-note">期間休みを登録した時点で、その期間の自分の仮組みがあれば対象シフトを外す。</div>';
    else if(key==='lateoff') h='<div class="spdemo-title"><h3>締切後の休み申請</h3><small>通常希望と分離</small></div><div class="spdemo-card"><div class="name">サンプルC ・ 10/12</div><div class="desc">家庭都合のため休み希望</div><span class="spdemo-chip amber">確認待ち</span><div class="spdemo-actions"><button class="spdemo-btn blue" onclick="this.parentElement.parentElement.querySelector(\'.spdemo-chip\').textContent=\'承認済み\'">承認</button><button class="spdemo-btn ghost">却下</button></div></div><div class="spdemo-note">承認された休みは、次に仮組みを再生成したとき除外される。</div>';
    else if(key==='reminder') h='<div class="spdemo-title"><h3>未提出 / 再通知</h3><small>不足日のみ判定</small></div><div class="spdemo-card"><div class="spdemo-stat"><strong>サンプルA</strong><span class="spdemo-chip red">未提出 3日・未通知</span></div><div class="spdemo-stat"><strong>サンプルB</strong><span class="spdemo-chip blue">未提出 1日・再通知済み</span></div><div class="spdemo-stat"><strong>サンプルC</strong><span class="spdemo-chip green">提出完了</span></div></div><div class="spdemo-note">期間休みの日は「未提出」に数えない。同じ周期・同じ人への再通知は重複記録しない。</div>';
    else if(key==='draft') h='<div class="spdemo-title"><h3>シフト自動仮組み</h3><small>6:00 → 翌6:00</small></div><div class="spdemo-card"><div class="spdemo-stat"><strong>基本必要人数</strong><span>2名</span></div><div class="spdemo-stat"><strong>17:00〜20:00</strong><span>3名に増員</span></div><div class="spdemo-stat"><strong>仮組み条件</strong><span>提出希望＋必要人数</span></div></div>'+timeline()+'<div class="spdemo-note">スキルは配置を決める条件には使わず、配置後の「警告」にだけ使う。</div><div class="spdemo-warn">現行の自動仮組みは「提出希望＋必要人数」が中心です。休憩、連勤、週労働時間、会社独自ルールまで含む最適化は今後の強化領域です。</div>';
    else if(key==='shift-edit') h='<div class="spdemo-title"><h3>仮組み編集 → 公開</h3><small>最後は人が決める</small></div>'+timeline()+'<div class="spdemo-actions"><button class="spdemo-btn ghost" onclick="alert(\'デモ：スタッフ・日付・開始/終了を編集できます\')">✎ バーを編集</button><button class="spdemo-btn primary" onclick="this.textContent=\'✓ 公開済み\'">シフトを公開</button></div><div class="spdemo-note">公開後の変更は「変更申請」に分けて履歴を残す。</div>';
    else if(key==='support') h='<div class="spdemo-title"><h3>応援勤務</h3><small>店舗をまたぐ</small></div><div class="spdemo-card"><div class="name">10/07 17:00〜22:00 ・ サンプル駅前店</div><span class="spdemo-chip blue">初勤務</span><div class="desc">Skill Passport：そのまま引き継ぎ<br>Store Guide：駅前店の差分だけ確認<br>発注：未習得のため警告</div></div>';
    else if(key==='national') h='<div class="spdemo-title"><h3>全国組織階層</h3><small>多店舗管理</small></div><div class="spdemo-tree"><div>🗾 全国</div><div class="l1">├ 北エリア（サンプル）</div><div class="l2">│ └ A県</div><div class="l3">│　└ Aブロック</div><div class="l4">│　　└ サンプル西口店</div><div class="l1">└ 南エリア（サンプル）</div><div class="l2">　└ B県</div></div><div class="spdemo-note">実運用では実在する組織名だけ登録。デモではすべて架空名称。</div>';
    else if(key==='hq') h='<div class="spdemo-title"><h3>本部一括配信</h3><small>対象範囲を選択</small></div><div class="spdemo-card"><div class="name">レジ受付手順 v3.2</div><div class="desc">対象：全国 ・ 要確認</div><span class="spdemo-chip green">公開済み</span></div><div class="spdemo-card"><div class="name">設備メンテナンス案内</div><div class="desc">対象：Aブロックのみ</div><span class="spdemo-chip amber">下書き</span></div><div class="spdemo-note">全店共通は本部配信、店舗固有はStore Guide。この分離が全国運用の前提。</div>';
    else if(key==='store-settings') h='<div class="spdemo-title"><h3>店舗運用設定</h3><small>店舗ごと</small></div><div class="spdemo-card"><div class="spdemo-stat"><strong>営業日表示</strong><span>06:00〜翌06:00</span></div><div class="spdemo-stat"><strong>夜勤</strong><span>23:00〜翌06:00</span></div><div class="spdemo-stat"><strong>基本必要人数</strong><span>2名</span></div><div class="spdemo-stat"><strong>スキル不足警告</strong><span class="spdemo-chip green">ON</span></div></div>';
    else if(key==='search') h='<div class="spdemo-title"><h3>大人数検索</h3><small>全国規模を想定</small></div><input class="spdemo-input" placeholder="氏名・店舗で検索" value="サンプル"><div class="spdemo-card"><div class="spdemo-stat"><strong>サンプルA</strong><span>西口店・レギュラー</span></div><div class="spdemo-stat"><strong>サンプルB</strong><span>駅前店・リーダー</span></div><div class="spdemo-stat"><strong>サンプルC</strong><span>中央店・店長</span></div></div><div class="spdemo-note">50件ずつページ分割して取得。数万人でも最初から全員を読み込まない。</div>';
    else if(key==='ops') h='<div class="spdemo-title"><h3>運用・復旧</h3><small>企業運用の土台</small></div><div class="spdemo-card"><div class="spdemo-stat"><strong>インシデント</strong><span class="spdemo-chip amber">1件 監視中</span></div><div class="spdemo-stat"><strong>監査ログ</strong><span>保持 1095日</span></div><div class="spdemo-stat"><strong>報告 / 質問</strong><span>保持 365日</span></div><div class="spdemo-stat"><strong>メディア</strong><span>保持 180日</span></div><div class="spdemo-stat"><strong>バックアップ</strong><span>実行履歴を記録</span></div></div>';
    else if(key==='roles') h='<div class="spdemo-title"><h3>役職・権限</h3><small>最小権限</small></div><div class="spdemo-card"><div class="spdemo-stat"><strong>レギュラー</strong><span>自分 / 利用店舗</span></div><div class="spdemo-stat"><strong>リーダー</strong><span>＋店舗一次対応</span></div><div class="spdemo-stat"><strong>店長 / MG / 統括</strong><span>＋管理</span></div><div class="spdemo-stat"><strong>オーナー</strong><span>＋監査</span></div><div class="spdemo-stat"><strong>本部</strong><span>＋全国管理</span></div></div><div class="spdemo-note">権限判定はSupabase RLSでも実施。UIを隠すだけの権限制御にしない。</div>';
    else if(key==='translation') h='<div class="spdemo-title"><h3>多言語</h3><small>表示言語の土台</small></div><div class="spdemo-card"><div class="name">対応ベース</div><div class="desc">日本語 / English / 简体中文 / 한국어 / Tiếng Việt / नेपाली / Português / සිංහල / தமிழ்</div></div><div class="spdemo-warn">動的な自由記述の自動翻訳バックエンドは今後強化する領域。UI辞書と表示基盤は実装済み。</div>';
    else if(key==='pwa') h='<div class="spdemo-title"><h3>PWA / オフライン</h3><small>iPhone・iPad対応</small></div><div class="spdemo-card"><div class="spdemo-stat"><strong>ホーム画面追加</strong><span class="spdemo-chip green">対応</span></div><div class="spdemo-stat"><strong>端末通知</strong><span class="spdemo-chip blue">基盤あり</span></div><div class="spdemo-stat"><strong>オフライン操作</strong><span>キュー保存</span></div></div><div class="spdemo-note">Web Pushの本番配信にはVAPID秘密情報の設定が別途必要。</div>';
    else if(key==='security') h='<div class="spdemo-title"><h3>セキュリティ</h3><small>現時点の防御</small></div><div class="spdemo-card"><div class="spdemo-stat"><strong>RLS</strong><span class="spdemo-chip green">有効</span></div><div class="spdemo-stat"><strong>権限関数</strong><span class="spdemo-chip green">公開境界を強化</span></div><div class="spdemo-stat"><strong>パスワード</strong><span>12文字＋大/小/数/記号</span></div><div class="spdemo-stat"><strong>監査</strong><span>オーナー以上</span></div></div><div class="spdemo-warn">Supabaseの漏洩パスワード照合は上位プラン機能のため現在OFF。アプリ側の強度チェックで補強中。</div>';

    setBody(common+h);
  }

  function handoverHtml(){
    const labels=['未確認','確認済み','対応中','完了'];
    let flow='<div class="spdemo-flow">';
    labels.forEach(function(x,i){ flow+='<span class="'+(i<=state.handover?'on':'')+'">'+x+'</span>'; });
    flow+='</div>';
    return '<div class="spdemo-title"><h3>引き継ぎワークフロー</h3><small>確認状況まで追跡</small></div><div class="spdemo-card"><div class="name">冷凍ケース右側の温度が高め</div><div class="desc">現在7℃。継続監視してください。</div>'+flow+'<div class="spdemo-stat"><strong>確認状況</strong><span>4 / 5名</span></div></div><button class="spdemo-btn primary" style="width:100%" onclick="SPDemo.advanceHandover()">'+(state.handover<3?'次の状態へ進める':'完了済み')+'</button>';
  }

  function advanceHandover(){
    if(state.handover<3) state.handover++;
    detail('handover');
  }

  function manualHtml(){
    return '<div class="spdemo-title"><h3>マニュアル / QR</h3><small>最新版を届ける</small></div><div class="spdemo-card"><div class="name">🎬 コピー機の用紙補充</div><div class="desc">本部作成・v1.3・映像 1:42・2026/09/23更新</div><span class="spdemo-chip '+(state.manualConfirmed?'green':'red')+'">'+(state.manualConfirmed?'最新版確認済み':'再確認必要')+'</span><button class="spdemo-btn blue" style="width:100%;margin-top:9px" onclick="SPDemo.confirmManual()">'+(state.manualConfirmed?'✓ 確認済み':'最新版を確認した')+'</button></div><div class="spdemo-note">機器のQRから該当マニュアルを直接開く。版が上がったら必要な人へ再確認を要求できる。</div>';
  }
  function confirmManual(){ state.manualConfirmed=true; detail('manual'); }

  function notificationHtml(){
    const isUnread=state.notification==='unread';
    const isRead=state.notification==='read';
    return '<div class="spdemo-title"><h3>通知センター</h3><small>未読 ≠ 未対応</small></div><div class="spdemo-card"><div class="name">シフト希望の提出期限が近づいています</div><div class="desc">10/1〜10/15分を提出してください。</div><span class="spdemo-chip '+(isUnread?'red':isRead?'blue':'green')+'">'+(isUnread?'未読':isRead?'既読・対応待ち':'対応済み')+'</span></div><div class="spdemo-actions"><button class="spdemo-btn blue" onclick="SPDemo.readNotification()">開いて既読</button><button class="spdemo-btn primary" onclick="SPDemo.resolveNotification()">対応済みにする</button></div><div class="spdemo-note">読むだけでは通知センターから消さない。提出や対応が終わったら「対応済み」で消える。</div>';
  }
  function readNotification(){ if(state.notification==='unread') state.notification='read'; detail('notification'); }
  function resolveNotification(){ state.notification='resolved'; detail('notification'); }

  function weekdayHtml(){
    const days=[['1','月'],['2','火'],['3','水'],['4','木'],['5','金'],['6','土'],['0','日']];
    let checks='<div class="spdemo-checks">';
    days.forEach(function(d){ checks+='<label><input class="spdemo-weekday" type="checkbox" value="'+d[0]+'" '+((d[0]==='2'||d[0]==='4')?'checked':'')+'>'+d[1]+'</label>'; });
    checks+='</div>';
    return '<div class="spdemo-title"><h3>曜日一括の休み希望</h3><small>'+SAMPLE_PERIOD+'</small></div><div class="spdemo-card"><div class="name">毎週休む曜日を選択</div><div class="desc">例：学校があるので火・木は毎週休み</div>'+checks+'<button class="spdemo-btn primary" style="width:100%" onclick="SPDemo.applyWeekday()">選んだ曜日を一括で休みにする</button><div id="spdemoWeekdayResult" style="margin-top:8px"></div></div><div class="spdemo-note">一括設定のあとでも、特定の日だけ個別に「出勤可能」へ上書きできる。</div>';
  }

  function applyWeekday(){
    const vals=Array.from(document.querySelectorAll('.spdemo-weekday:checked')).map(function(x){return Number(x.value);});
    const out=[];
    for(let d=1;d<=15;d++){
      const ds='2026-10-'+String(d).padStart(2,'0');
      const wd=new Date(ds+'T00:00:00Z').getUTCDay();
      if(vals.includes(wd)) out.push(ds.slice(5).replace('-','/'));
    }
    const box=document.getElementById('spdemoWeekdayResult');
    if(!box) return;
    box.innerHTML='<div class="desc">休み希望にする日：'+out.map(function(x){return '<span class="spdemo-chip red">'+x+'</span>';}).join('')+'</div><button class="spdemo-btn blue" style="width:100%;margin-top:8px" onclick="SPDemo.weekdayOverride()">10/08だけ出勤可能に上書き</button>';
  }

  function weekdayOverride(){
    const box=document.getElementById('spdemoWeekdayResult');
    if(box) box.innerHTML='<div class="desc"><span class="spdemo-chip red">火・木を一括休み</span><span class="spdemo-chip green">10/08だけ 17:00〜22:00 出勤可能</span></div>';
  }

  function addFab(){
    if(document.getElementById('spdemoFab')) return;
    const b=document.createElement('button');
    b.id='spdemoFab'; b.className='spdemo-fab'; b.textContent='▶ プレゼン';
    b.onclick=open;
    document.body.appendChild(b);
  }

  function addHomePitch(){
    const home=document.getElementById('home');
    if(!home || document.getElementById('spdemoPitch')) return;
    const hero=home.querySelector('.hero');
    if(!hero) return;
    const d=document.createElement('div');
    d.id='spdemoPitch';
    d.className='spdemo-pitch';
    d.innerHTML='<h3>最新デモ '+VERSION+'</h3><p>直近のシフト仮組み・曜日一括休み・期間休み・通知管理・全国展開基盤まで、説明付きで確認できます。</p><div class="spdemo-pitch-actions"><button class="dark" onclick="SPDemo.tour(0);document.getElementById(\'spdemoOverlay\').classList.add(\'open\')">60秒で見る</button><button class="light" onclick="SPDemo.open()">全機能ガイド</button></div>';
    hero.insertAdjacentElement('afterend',d);
  }

  function addRecruitmentCard(){
    const home=document.getElementById('home');
    const pitch=document.getElementById('spdemoPitch');
    if(!home || !pitch || document.getElementById('spdemoRecruitment')) return;
    const sec=document.createElement('section');
    sec.id='spdemoRecruitment'; sec.className='section';
    sec.innerHTML='<div class="head"><h3>シフト</h3><small>最新デモ</small></div><div class="card tapcard" style="border-color:#f5c27f;background:#fff9f0" onclick="SPDemo.open();SPDemo.detail(\'shift-request\')"><div class="row"><div class="grow"><div class="title" style="font-size:18px">シフト希望受付中</div><div class="sub">10/1〜10/15 ・ 締切 9/28 23:59</div></div><span class="tag amber">締切間近</span></div><div class="sub" style="margin-top:8px">曜日一括休み・期間休み・締切後申請にも対応 →</div></div>';
    pitch.insertAdjacentElement('afterend',sec);
  }

  function addShiftLatest(){
    const page=document.getElementById('shift');
    if(!page || document.getElementById('spdemoShiftLatest')) return;
    const s=document.createElement('section');
    s.id='spdemoShiftLatest'; s.className='section';
    s.innerHTML='<div class="head"><h3>最新版シフト機能</h3><small>デモ</small></div><div class="quick"><div class="card tapcard" onclick="SPDemo.open();SPDemo.detail(\'weekday\')"><div class="title">🗓 曜日一括休み</div><div class="sub">毎週の固定休を一度で入力</div></div><div class="card tapcard" onclick="SPDemo.open();SPDemo.detail(\'unavailable\')"><div class="title">🏫 期間休み</div><div class="sub">実習・帰省をまとめて除外</div></div><div class="card tapcard" onclick="SPDemo.open();SPDemo.detail(\'reminder\')"><div class="title">📨 未提出再通知</div><div class="sub">不足日だけ・重複防止</div></div><div class="card tapcard" onclick="SPDemo.open();SPDemo.detail(\'draft\')"><div class="title">⚡ 自動仮組み</div><div class="sub">必要人数からたたき台を生成</div></div></div>';
    page.appendChild(s);
  }

  function refreshHomeDate(){
    const hero=document.querySelector('#home .hero');
    if(hero){
      const tiny=hero.querySelector('.tiny');
      if(tiny) tiny.textContent='2026年9月23日';
    }
    const title=document.getElementById('homeTitle');
    if(title && title.textContent.indexOf('の今日')>=0) title.textContent='本日の'+title.textContent.replace('の今日','');
  }

  window.SPDemo={
    open:open,close:close,overview:overview,tour:tour,detail:detail,persona:persona,scrollFeatures:scrollFeatures,
    advanceHandover:advanceHandover,confirmManual:confirmManual,readNotification:readNotification,resolveNotification:resolveNotification,
    applyWeekday:applyWeekday,weekdayOverride:weekdayOverride
  };

  function init(){
    css(); ensureOverlay(); addFab(); addHomePitch(); addRecruitmentCard(); addShiftLatest(); refreshHomeDate();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();