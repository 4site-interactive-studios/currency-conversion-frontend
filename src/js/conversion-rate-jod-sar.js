class CurrencyConverter {
  constructor() {
    this.lang = "USD";
    this.pageLang = $("html")[0].lang;
    this.rates = {};
    this.containerLoaded = false;
  }

  loadLang(lang, currency) {
    let info = "";
    switch (lang) {
      case "en":
        info =
          '<p class="langInfo"><strong>Your gift will be charged in U.S. dollars (USD).</strong> To see the ' +
          this.currencyLang("en", currency) +
          ' equivalent choose an amount in USD below. Both amounts will be displayed. FX rates provided by Fixer.io.</p><hr class="currencyDivider"><h3 id="pseudoRates"></h3>';
        break;
      case "es":
        info =
          '<p class="langInfo"><strong>Todos los donativos se convierten a dólares estadounidenses (USD).</strong> Usa esta calculadora para determinar el monto de tu donativo en ' +
          this.currencyLang("es", currency) +
          ' según el tipo de cambio actual provisto por Fixer.io.</p><hr class="currencyDivider"><h3 id="pseudoRates"></h3>';
        break;
      default:
        info =
          '<p class="langInfo"><strong>Your gift will be charged in U.S. dollars (USD).</strong> To see the ' +
          this.currencyLang("en", currency) +
          ' equivalent choose an amount in USD below. Both amounts will be displayed. FX rates provided by Fixer.io.</p><hr class="currencyDivider"><h3 id="pseudoRates"></h3>';
    }

    return info;
  }

  currencyLang(lang, currency) {
    let info = {};
    switch (currency) {
      case "JOD":
        info = { es: "dinares Jordano (JOD)", en: "Jordanian Dinar (JOD)" };
        break;
      case "SAR":
        info = { es: "riyales Saudíes (SAR)", en: "Saudi Riyal (SAR)" };
        break;
      default:
        info = { es: "(" + currency + ")", en: "(" + currency + ")" };
    }

    return info[lang];
  }

  loadConversionContainer() {
    if (this.containerLoaded) return false;
    $.ajax({
      type: "get",
      url: "https://resources.peta.org/engaging-networks/services/currency-conversion-backend/fixer-io.php",
      dataType: "JSON",
      success: (res) => {
        this.appendConverter(res);
      },
      error: (res) => {
        console.error(res.responseText);
      },
    });
  }

  conversionRate(currentLangRate, selectedAmt, calc, currency) {
    let symbol = "$";
    if (currency == "EUR") {
      symbol = "€";
    }

    const conversionRateText =
      this.lang +
      "&nbsp;$" +
      this.numberFormatter(selectedAmt) +
      " <wbr>= " +
      currency +
      "&nbsp;" +
      symbol +
      this.numberFormatter(calc);
    $("h3#pseudoRates").html(conversionRateText);
  }

  numberFormatter(num) {
    const toFixedNum = parseFloat(num).toFixed(2);
    const wholeAndDecimal = String(toFixedNum).split(".");

    const reversedWholeNumber = wholeAndDecimal[0].split("").reverse();
    let formattedOutput = [];

    jQuery.each(reversedWholeNumber, function (index, digit) {
      formattedOutput.push(digit);
      if ((index + 1) % 3 === 0 && index < reversedWholeNumber.length - 1) {
        formattedOutput.push(",");
      }
    });

    formattedOutput =
      formattedOutput.reverse().join("") + "." + wholeAndDecimal[1];

    return formattedOutput;
  }

  appendConverter(res) {
    if (this.containerLoaded) return;
    let node = [res];
    $(".en__field--donationAmt").before(
      '<style>p.currencySelectLabel{display:inline;}p.langInfo{font-size:.74rem;}.en__field--pseudo-currencyConverter{width: 100%;}.en__field--pseudo-currencyText{width: 120px; display: inline-block !important;     margin-left: 0.1rem;}#en__field_pseudo_currencyConverter{max-width: 110px !important;min-width: 80px !important;background-position: calc(100% + 1rem); background-origin: content-box; padding-right: 1.5rem;padding-left: 1rem;margin-left: .5rem;margin-bottom: 0;}select#en__field_pseudo_currencyConverter:focus{box-shadow: 0 0 0;}#pseudo_Info{padding: 1rem;display: block;border: 1px solid rgb(204, 204, 204);border-radius: 5px;margin-top: .25rem;} hr.currencyDivider{margin: 0 0 1rem 0;}</style><div class="en__field en__field--select en__field--0000 en__field--pseudo-currencyConverter"><div class="en__field__element en__field__element--select en__field--pseudo-currencyText"><select id="en__field_pseudo_currencyConverter" class="en__field__input en__field__input--select" name="currencyConverter"></select></div><div id="pseudo_Info" style="display:none;"></div></div>'
    );

    if (node[0].success == false || node == null) {
      $(".en__field--pseudo-currencyConverter").css("display", "none");
      if (node[0].success == false) {
        console.error(node[0].error["info"] + " https://fixer.io/");
      }
      this.containerLoaded = false;
      return false;
    }

    this.rates = {
      USD: node[0].rates.USD,
      JOD: node[0].rates.JOD,
      SAR: node[0].rates.SAR,
    };

    jQuery.each(this.rates, (key, value) => {
      if (key == this.lang) {
        if (this.pageLang == "es") {
          $("div.en__field--pseudo-currencyText").before(
            '<p class="currencySelectLabel">Moneda de Preferencia</p>'
          );
          $("select#en__field_pseudo_currencyConverter").append(
            '<option value="' + key + '">' + key + "</option>"
          );
        } else {
          $("div.en__field--pseudo-currencyText").before(
            '<p class="currencySelectLabel">Compare Currency</p>'
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

    $(document).on(
      "change",
      "select#en__field_pseudo_currencyConverter",
      () => {
        console.log("Currency Converter Changed");
        const value = $(
          "select#en__field_pseudo_currencyConverter option:selected"
        ).val();
        if (value != this.lang) {
          $("div#pseudo_Info").css("display", "block");
        } else {
          $("div#pseudo_Info").css("display", "none");
        }

        const selectedRate = this.rates[value];
        const currentLangRate = this.rates[this.lang];
        let selectedAmt = $(
          'input[name="transaction.donationAmt"]:checked'
        ).val();

        $("#pseudo_Info").html(this.loadLang(this.pageLang, value));

        let calc = (selectedAmt * selectedRate) / currentLangRate;

        //Determine if the value is nothing
        if (!selectedAmt) {
          //If the input box is empty, set the amount to 0 for default output
          if (!$('input[name="transaction.donationAmt.other"]').val()) {
            selectedAmt = 0;
          } else {
            //If there is a value in the input box after changing currency, get the value in the input box
            selectedAmt = $(
              'input[name="transaction.donationAmt.other"]'
            ).val();
          }
          //calculate the selected amount
          calc = (selectedAmt * selectedRate) / currentLangRate;
        }

        //Default output when the dropdown has been selected
        this.conversionRate(currentLangRate, selectedAmt, calc, value);
      }
    );

    $(document).on("change", 'input[name="transaction.recurrpay"]', () => {
      console.log("Recurring Payment Changed");
      const selectedRate =
        this.rates[
          $("select#en__field_pseudo_currencyConverter option:selected").val()
        ];
      const currentLangRate = this.rates[this.lang];
      let selectedAmt = $(
        'input[name="transaction.donationAmt"]:checked'
      ).val();

      let calc = (selectedAmt * selectedRate) / currentLangRate;

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
      this.conversionRate(
        currentLangRate,
        selectedAmt,
        calc,
        $("select#en__field_pseudo_currencyConverter option:selected").val()
      );
    });

    $("select#en__field_pseudo_currencyConverter option:selected").each(() => {
      const value = $(
        "select#en__field_pseudo_currencyConverter option:selected"
      ).val();
      const selectedRate = this.rates[value];
      const currentLangRate = this.rates[this.lang];
      let selectedAmt = $(
        'input[name="transaction.donationAmt"]:checked'
      ).val();

      $("div#pseudo_Info").html(this.loadLang(this.pageLang, value));

      let calc = (selectedAmt * selectedRate) / currentLangRate;

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
      this.conversionRate(currentLangRate, selectedAmt, calc, value);
    });

    $(document).on("click", 'input[name="transaction.donationAmt"]', () => {
      console.log("Donation Amount Clicked");
      let selectedAmt = $(
        'input[name="transaction.donationAmt"]:checked'
      ).val();
      const currency = $(
        "select#en__field_pseudo_currencyConverter option:selected"
      ).val();

      //Get the rate
      const selectedRate = this.rates[currency] || 1;
      const currentLangRate = this.rates[this.lang];

      //calculate the rate
      const calc = (selectedAmt * selectedRate) / currentLangRate;

      //Output text
      //Setting default value when the custom input is empty when clicking the other button
      if (!selectedAmt) {
        this.conversionRate(currentLangRate, 0, 0, currency);
      } else {
        this.conversionRate(currentLangRate, selectedAmt, calc, currency);
      }
    });

    //calculate the rates when inputting the value
    $('input[name="transaction.donationAmt.other"]').keyup(() => {
      const currency = $(
        "select#en__field_pseudo_currencyConverter option:selected"
      ).val();
      const value = $('input[name="transaction.donationAmt.other"]').val();
      const selectedRate = this.rates[currency] || 1;
      const currentLangRate = this.rates[this.lang];

      const calc = (value * selectedRate) / currentLangRate;

      //Setting default value when the custom input is empty
      if (!value) {
        this.conversionRate(currentLangRate, 0, 0, currency);
      } else {
        $("h3#pseudoRates").html(
          this.conversionRate(currentLangRate, value, calc, currency)
        );
      }
    });

    this.containerLoaded = true;
  }
}

// Instantiate the class and make the first call
const currencyConverter = new CurrencyConverter();
currencyConverter.loadConversionContainer();
