(function () {
  var ACRE_TO_HA = 0.404686;

  var RATES = {
    maize:   { label: 'Maize',   min: 20, typical: 22, max: 25 },
    rice:    { label: 'Rice',    min: 40, typical: 50, max: 60 },
    soybean: { label: 'Soybean', min: 60, typical: 70, max: 80 }
  };

  var state = {
    crop: 'maize',
    unit: 'acres',
    size: 2,
    rateOverride: null
  };

  var cropTabs = document.getElementById('cropTabs');
  var farmSizeInput = document.getElementById('farmSize');
  var unitToggle = document.getElementById('unitToggle');
  var sizeConvert = document.getElementById('sizeConvert');
  var advancedBlock = document.getElementById('advancedBlock');
  var rateInput = document.getElementById('rateInput');
  var rateLabel = document.getElementById('rateLabel');
  var rateHint = document.getElementById('rateHint');

  var resultNumeric = document.getElementById('resultNumeric');
  var resultVeg = document.getElementById('resultVeg');
  var resultKg = document.getElementById('resultKg');
  var resultRange = document.getElementById('resultRange');
  var resultBags = document.getElementById('resultBags');
  var resultWaLink = document.getElementById('resultWaLink');
  var vegWaLink = document.getElementById('vegWaLink');

  if (!cropTabs) return;

  function toHectares(size, unit) {
    return unit === 'acres' ? size * ACRE_TO_HA : size;
  }

  function fmt(n) {
    if (n < 10) return n.toFixed(1);
    return Math.round(n).toString();
  }

  function waLink(text) {
    return 'https://wa.me/233208373586?text=' + encodeURIComponent(text);
  }

  function render() {
    var isVeg = state.crop === 'vegetable';

    if (isVeg) {
      resultNumeric.hidden = true;
      resultVeg.hidden = false;
      advancedBlock.hidden = true;
    } else {
      resultNumeric.hidden = false;
      resultVeg.hidden = true;
      advancedBlock.hidden = false;
    }

    var areaHa = toHectares(parseFloat(state.size) || 0, state.unit);
    var areaAcres = state.unit === 'acres' ? state.size : state.size / ACRE_TO_HA;

    if (state.unit === 'acres') {
      sizeConvert.textContent = areaHa > 0 ? (state.size + ' acres ≈ ' + areaHa.toFixed(2) + ' hectares') : '';
    } else {
      sizeConvert.textContent = areaHa > 0 ? (state.size + ' hectares ≈ ' + areaAcres.toFixed(2) + ' acres') : '';
    }

    if (isVeg) {
      var vegMsg = 'Hello Qualiseed, I have a farm of ' + (state.size || '?') + ' ' + state.unit + ' and I\'d like a vegetable seed recommendation.';
      vegWaLink.href = waLink(vegMsg);
      return;
    }

    var rate = RATES[state.crop];
    var typicalRate = state.rateOverride != null ? state.rateOverride : rate.typical;

    if (document.activeElement !== rateInput) {
      rateInput.value = typicalRate;
    }
    rateLabel.textContent = 'Seeding rate for ' + rate.label + ' (kg per hectare)';
    rateHint.textContent = 'Typical range: ' + rate.min + '–' + rate.max + ' kg/ha. Adjust if you have a variety-specific recommendation.';

    var kgTypical = typicalRate * areaHa;
    var kgMin = rate.min * areaHa;
    var kgMax = rate.max * areaHa;

    resultKg.textContent = areaHa > 0 ? fmt(kgTypical) : '—';
    resultRange.textContent = areaHa > 0
      ? ('Typical range: ' + fmt(kgMin) + '–' + fmt(kgMax) + ' kg for your farm size')
      : 'Enter a farm size above to see your estimate';

    var bags = kgTypical / 25;
    resultBags.textContent = areaHa > 0
      ? ('≈ ' + Math.ceil(bags) + ' standard 25kg bag' + (Math.ceil(bags) === 1 ? '' : 's') + ' (confirm exact pack sizes with us)')
      : '';

    var waMsg = 'Hello Qualiseed, I have a ' + (state.size || '?') + ' ' + state.unit + ' ' + rate.label.toLowerCase() +
      ' farm and my estimated seed requirement is ' + fmt(kgTypical) + ' kg. Can you confirm availability and pricing?';
    resultWaLink.href = waLink(waMsg);
  }

  cropTabs.addEventListener('click', function (e) {
    var btn = e.target.closest('.crop-tab');
    if (!btn) return;
    state.crop = btn.dataset.crop;
    state.rateOverride = null;
    cropTabs.querySelectorAll('.crop-tab').forEach(function (t) {
      t.classList.toggle('active', t === btn);
      t.setAttribute('aria-selected', t === btn ? 'true' : 'false');
    });
    render();
  });

  unitToggle.addEventListener('click', function (e) {
    var btn = e.target.closest('.unit-btn');
    if (!btn) return;
    state.unit = btn.dataset.unit;
    unitToggle.querySelectorAll('.unit-btn').forEach(function (t) {
      t.classList.toggle('active', t === btn);
    });
    render();
  });

  farmSizeInput.addEventListener('input', function () {
    state.size = parseFloat(farmSizeInput.value) || 0;
    render();
  });

  rateInput.addEventListener('input', function () {
    var v = parseFloat(rateInput.value);
    state.rateOverride = isNaN(v) ? null : v;
    render();
  });

  render();
})();
