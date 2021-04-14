var lang = "USD";
var pageLang = $("html")[0].lang;
var containerLoaded = false;
var ipCanada = false;

// Return true if user is "from Canada" by checking:
// 1 - Browser Language
// 2 - Country Field
// 3 - User's IP
function fromCanada() {
  if (pageLang != "en") return false;
  var browserLang = window.navigator.userLanguage || window.navigator.language;
  var countryField = $("#en__field_supporter_country").val();
  if (browserLang == "en-CA" || countryField == "CA") return true;
  return ipCanada;
}

console.log("From Canada?", fromCanada());
//Function to determine the output of the language in the info box
function loadLang(lang, currency) {
  var info = "";
  switch (lang) {
    case "en":
      info =
        '<p class="langInfo">All gifts are processed in U.S. dollars (USD). Use this calculator to determine the amount of your gift in ' +
        currencyLang("en", currency) +
        ' based on current exchange rates provided by Fixer.io.</p><hr class="currencyDivider"><h3 id="pseudoRates"></h3>';
      break;
    case "es":
      info =
        '<p class="langInfo">Todos los donativos se convierten a dólares estadounidenses (USD). Usa esta calculadora para determinar el monto de tu donativo en ' +
        currencyLang("es", currency) +
        ' según el tipo de cambio actual provisto por Fixer.io.</p><hr class="currencyDivider"><h3 id="pseudoRates"></h3>';
      break;
    default:
      info =
        '<p class="langInfo">Conversion to ' +
        currencyLang("en", currency) +
        ' are based on current exchange rates to aid you in your selection. All gifts are shown in U.S. dollars (USD).</p><hr class="currencyDivider"><h3 id="pseudoRates"></h3>';
  }

  return info;
}

function currencyLang(lang, currency) {
  var info = {};
  switch (currency) {
    case "MXN":
      info = { es: "pesos Mexicanos (MXN)", en: "Mexican pesos (MXN)" };
      break;
    case "EUR":
      info = { es: "Euros (EUR)", en: "Euros (EUR)" };
      break;
    case "ARS":
      info = { es: "pesos Argentinos (ARS)", en: "Argentine pesos (ARS)" };
      break;
    case "COP":
      info = { es: "pesos Colombianos (COP)", en: "Colombian pesos (COP)" };
      break;
    case "CAD":
      info = { es: "dólares Canadienses (CAD)", en: "Canadian dollars (CAD)" };
      break;
    case "CLP":
      info = { es: "pesos Chilenos (CLP)", en: "Chilean pesos (CLP)" };
      break;
    default:
      info = { es: "(" + currency + ")", en: "(" + currency + ")" };
  }

  return info[lang];
}

//jQuery for currency

//regular expressions to extract IP and country values
const countryCodeExpression = /loc=([\w]{2})/;
const userIPExpression = /ip=([\w\.]+)/;
//automatic country determination.
function initCountry() {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 3000;
    xhr.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 200) {
          countryCode = countryCodeExpression.exec(this.responseText);
          ip = userIPExpression.exec(this.responseText);
          if (
            countryCode === null ||
            countryCode[1] === "" ||
            ip === null ||
            ip[1] === ""
          ) {
            reject("IP/Country code detection failed");
          }
          let result = {
            countryCode: countryCode[1],
            IP: ip[1],
          };
          resolve(result);
        } else {
          reject(xhr.status);
        }
      }
    };
    xhr.ontimeout = function() {
      reject("timeout");
    };
    xhr.open("GET", "https://www.cloudflare.com/cdn-cgi/trace", true);
    xhr.send();
  });
}

function loadConversionContainer() {
  if (containerLoaded) return false;
  //Get the cache
  $.ajax({
    type: "get",
    url:
      "https://resources.peta.org/engaging-networks/services/currency-conversion-backend/fixer-io.php",
    dataType: "JSON",
    success: function(res) {
      if (fromCanada() || pageLang !== "en") {
        appendConverter(res);
      }
    },
    //Could not get fixer.io API
    error: function(res) {
      console.error(res.responseText);
    },
  });
}

function appendConverter(res) {
  if (containerLoaded) return;
  var node = [res];
  //Initiate appending the currency converter selector
  $(".en__field--donationAmt").before(
    '<style>p.currencySelectLabel{display:inline;}p.langInfo{font-size:.8rem;}.en__field--pseudo-currencyConverter{width: 100%;}.en__field--pseudo-currencyText{width: 120px; display: inline-block !important;     margin-left: 0.1rem;}#en__field_pseudo_currencyConverter{max-width: 110px !important;min-width: 80px !important;background-position: calc(100% + 1rem);padding-right: 1.5rem;padding-left: 1rem;margin-left: .5rem;margin-bottom: 0;}select#en__field_pseudo_currencyConverter:focus{box-shadow: 0 0 0;}#pseudo_Info{padding: 1rem;display: block;border: 1px solid rgb(204, 204, 204);border-radius: 5px;margin-top: .25rem;} hr.currencyDivider{margin: 0 0 1rem 0;}</style><div class="en__field en__field--select en__field--0000 en__field--pseudo-currencyConverter"><div class="en__field__element en__field__element--select en__field--pseudo-currencyText"><select id="en__field_pseudo_currencyConverter" class="en__field__input en__field__input--select" name="currencyConverter"></select></div><div id="pseudo_Info" style="display:none;"></div></div>'
  );

  //If there is an error in the API, then the block is hidden
  if (node[0].success == false || node == null) {
    $(".en__field--pseudo-currencyConverter").css("display", "none");
    if (node[0].success == false) {
      console.error(node[0].error["info"] + " https://fixer.io/");
    }
    containerLoaded = false;
    return false;
  }
  if (fromCanada() && pageLang != "es") {
    node[0].rates = {
      USD: node[0].rates.USD,
      CAD: node[0].rates.CAD,
      EUR: node[0].rates.EUR,
      GBP: node[0].rates.GBP,
      MXN: node[0].rates.MXN,
    };
  } else {
    node[0].rates = {
      USD: node[0].rates.USD,
      MXN: node[0].rates.MXN,
      EUR: node[0].rates.EUR,
      ARS: node[0].rates.ARS,
      COP: node[0].rates.COP,
      CAD: node[0].rates.CAD,
      CLP: node[0].rates.CLP,
    };
  }
  jQuery.each(node[0].rates, function(key, value) {
    if (key == lang) {
      if (pageLang == "es") {
        $("div.en__field--pseudo-currencyText").before(
          '<p class="currencySelectLabel">Moneda de Preferencia</p>'
        );
        $("select#en__field_pseudo_currencyConverter").append(
          '<option value="' + key + '">' + key + "</option>"
        );
      } else {
        $("div.en__field--pseudo-currencyText").before(
          '<p class="currencySelectLabel">Preferred Currency</p>'
        );
        $("select#en__field_pseudo_currencyConverter").append(
          '<option value="' + key + '">' + key + "</option>"
        );
      }
    } else {
      $("select#en__field_pseudo_currencyConverter").append(
        '<option value="' + key + '">' + key + "</option>"
      );
    }
  });

  function numberFormatter(num) {
    //console.log(num)
    var toFixedNum = parseFloat(num).toFixed(2);
    var wholeAndDecimal = String(toFixedNum).split(".");
    //console.log(wholeAndDecimal)

    var reversedWholeNumber = Array.from(wholeAndDecimal[0]).reverse();
    var formattedOutput = [];

    jQuery.each(reversedWholeNumber, function(index, digit) {
      formattedOutput.push(digit);
      if ((index + 1) % 3 === 0 && index < reversedWholeNumber.length - 1) {
        formattedOutput.push(",");
      }
    });

    formattedOutput =
      formattedOutput.reverse().join("") + "." + wholeAndDecimal[1];

    return formattedOutput;
  }

  function conversionRate(currentLangRate, selectedAmt, calc, currency) {
    var symbol = "$";
    if (currency == "EUR") {
      symbol = "€";
    }

    var conversionRate =
      lang +
      "&nbsp;$" +
      numberFormatter(selectedAmt) +
      " <wbr>= " +
      currency +
      "&nbsp;" +
      symbol +
      numberFormatter(calc);
    $("h3#pseudoRates").html(conversionRate);
  }

  $(document).on(
    "change",
    "select#en__field_pseudo_currencyConverter",
    function() {
      console.log("Currency Converter Changed");
      if (this.value != lang) {
        $("div#pseudo_Info").css("display", "block");
      } else {
        $("div#pseudo_Info").css("display", "none");
      }

      var selectedRate = node[0].rates[this.value];
      var currentLangRate = node[0].rates[lang];
      var selectedAmt = $(
        'input[name="transaction.donationAmt"]:checked'
      ).val();
      //var formatter = new Intl.NumberFormat('en-US', {
      //    style: 'currency',
      //    currency: this.value,
      //    currencyDisplay: 'narrowSymbol'
      //});
      $("#pseudo_Info").html(loadLang(pageLang, this.value));

      var calc = (selectedAmt * selectedRate) / currentLangRate;

      //Determine if the value is nothing
      if (!selectedAmt) {
        //If the input box is empty, set the amount to 0 for default output
        if (!$('input[name="transaction.donationAmt.other"]').val()) {
          selectedAmt = 0;
        } else {
          //If there is a value in the input box after changing currency, get the value in the input box
          selectedAmt = $('input[name="transaction.donationAmt.other"]').val();
        }
        //calculate the selected amount
        calc = (selectedAmt * selectedRate) / currentLangRate;
      }

      //Default output when the dropdown has been selected
      conversionRate(currentLangRate, selectedAmt, calc, this.value);
    }
  );

  $(document).on("change", 'input[name="transaction.recurrpay"]', function() {
    console.log("Recurrance Changed");
    var selectedRate =
      node[0].rates[
        $("select#en__field_pseudo_currencyConverter option:selected").val()
      ];
    var currentLangRate = node[0].rates[lang];
    var selectedAmt = $('input[name="transaction.donationAmt"]:checked').val();

    var calc = (selectedAmt * selectedRate) / currentLangRate;

    //Determine if the value is nothing
    if (!selectedAmt) {
      //If the input box is empty, set the amount to 0 for default output
      if (!$('input[name="transaction.donationAmt.other"]').val()) {
        selectedAmt = 0;
        calc = 0;
      } else {
        //If there is a value in the input box after changing currency, get the value in the input box
        selectedAmt = $('input[name="transaction.donationAmt.other"]').val();
        calc = (selectedAmt * selectedRate) / currentLangRate;
      }
    }

    //Default output when the dropdown has been selected
    conversionRate(
      currentLangRate,
      selectedAmt,
      calc,
      $("select#en__field_pseudo_currencyConverter option:selected").val()
    );
  });

  $("select#en__field_pseudo_currencyConverter option:selected").each(
    function() {
      var selectedRate = node[0].rates[this.value];
      var currentLangRate = node[0].rates[lang];
      var selectedAmt = $(
        'input[name="transaction.donationAmt"]:checked'
      ).val();

      $("div#pseudo_Info").html(loadLang(pageLang, this.value));

      var calc = (selectedAmt * selectedRate) / currentLangRate;

      //Determine if the value is nothing
      if (!selectedAmt) {
        //If the input box is empty, set the amount to 0 for default output
        if (!$('input[name="transaction.donationAmt.other"]').val()) {
          selectedAmt = 0;
        } else {
          //If there is a value in the input box after changing currency, get the value in the input box
          selectedAmt = $('input[name="transaction.donationAmt.other"]').val();
        }
        //calculate the selected amount
        calc = (selectedAmt * selectedRate) / currentLangRate;
      }

      //Default output when the dropdown has been selected
      conversionRate(currentLangRate, selectedAmt, calc, this.value);
    }
  );

  $(document).on("click", 'input[name="transaction.donationAmt"]', function() {
    console.log("Donation Amount Clicked");
    selectedAmt = $('input[name="transaction.donationAmt"]:checked').val();
    currency = $(
      "select#en__field_pseudo_currencyConverter option:selected"
    ).val();

    //Get the rate
    selectedRate = node[0].rates[currency];
    currentLangRate = node[0].rates[lang];

    //calculate the rate
    calc = (selectedAmt * selectedRate) / currentLangRate;

    //Output text
    //Setting default value when the custom input is empty when clicking the other button
    if (!selectedAmt) {
      conversionRate(currentLangRate, 0, 0, currency);
    } else {
      conversionRate(currentLangRate, selectedAmt, calc, currency);
    }
  });

  //calculate the rates when inputting the value
  $('input[name="transaction.donationAmt.other"]').keyup(function() {
    currency = $(
      "select#en__field_pseudo_currencyConverter option:selected"
    ).val();
    selectedRate = node[0].rates[currency];
    currentLangRate = node[0].rates[lang];

    calc = (this.value * selectedRate) / currentLangRate;

    //Setting default value when the custom input is empty
    if (!this.value) {
      conversionRate(currentLangRate, 0, 0, currency);
    } else {
      $("h3#pseudoRates").html(
        conversionRate(currentLangRate, this.value, calc, currency)
      );
    }
  });
  containerLoaded = true;
}

// First Call
initCountry()
  .then((result) => {
    // for DEBUGGING only
    // result.countryCode="CA";
    ipCanada = result.countryCode === "CA";
    loadConversionContainer();
  })
  .catch((e) => console.log(e));

$("#en__field_supporter_country").change(function() {
  loadConversionContainer();
});
