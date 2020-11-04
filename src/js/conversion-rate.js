var lang = "USD";
var pageLang = $("html")[0].lang;

//Function to determine the output of the language in the info box
function loadLang(lang, currency) {
  var info = "";
  switch (lang) {
    case "en":
      info =
        '<p class="langInfo">All gifts are processed in U.S. dollars (USD). Use this calculator to determine the amount of your gift in ' +
        currencyLang("en", currency) +
        ' based on current exchange rates provided by Fixer.io</p><hr class="currencyDivider"><h3 id="pseudoRates"></h3>';
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

//Get the cache
$.ajax({
  type: "get",
  url:
    "https://resources.peta.org/engaging-networks/services/currency-conversion-backend/fixer-io.php",
  dataType: "JSON",
  success: function(res) {
    appendConverter(res);
  },
  //Could not get fixer.io API
  error: function(res) {
    console.error(res.responseText);
  },
});

function appendConverter(res) {
  var node = [res];
  //Initiate appending the currency converter selector
  $(".en__field--donationAmt").before(
    '<style>p.currencySelectLabel{display:inline;}p.langInfo{font-size:.8rem;}.en__field--pseudo-currencyConverter{width: 100%;}.en__field--pseudo-currencyText{display: inline-block !important;     margin-left: 0.1rem;}#en__field_pseudo_currencyConverter{max-width: 95px !important;min-width: 80px !important;background-position: calc(100% + 1rem);padding-right: 1.5rem;padding-left: 1rem;margin-left: .5rem;margin-bottom: 0;}select#en__field_pseudo_currencyConverter:focus{box-shadow: 0 0 0;}#pseudo_Info{padding: 1rem;display: block;border: 1px solid rgb(204, 204, 204);border-radius: 5px;margin-top: .25rem;} hr.currencyDivider{margin: 0 0 1rem 0;}</style><div class="en__field en__field--select en__field--0000 en__field--pseudo-currencyConverter"><div class="en__field__element en__field__element--select en__field--pseudo-currencyText"><select id="en__field_pseudo_currencyConverter" class="en__field__input en__field__input--select" name="currencyConverter"></select></div><div id="pseudo_Info" style="display:none;"></div></div>'
  );

  //If there is an error in the API, then the block is hidden
  if (node[0].success == false || node == null || !Array.from) {
    $(".en__field--pseudo-currencyConverter").css("display", "none");
    if (node[0].success == false) {
      console.error(node[0].error["info"] + " https://fixer.io/");
    }
  } else {
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
      if (!Array.from) {
        Array.from = (function() {
          var symbolIterator;
          try {
            symbolIterator = Symbol.iterator
              ? Symbol.iterator
              : "Symbol(Symbol.iterator)";
          } catch (e) {
            symbolIterator = "Symbol(Symbol.iterator)";
          }

          var toStr = Object.prototype.toString;
          var isCallable = function(fn) {
            return (
              typeof fn === "function" || toStr.call(fn) === "[object Function]"
            );
          };
          var toInteger = function(value) {
            var number = Number(value);
            if (isNaN(number)) return 0;
            if (number === 0 || !isFinite(number)) return number;
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
          };
          var maxSafeInteger = Math.pow(2, 53) - 1;
          var toLength = function(value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
          };

          var setGetItemHandler = function setGetItemHandler(
            isIterator,
            items
          ) {
            var iterator = isIterator && items[symbolIterator]();
            return function getItem(k) {
              return isIterator ? iterator.next() : items[k];
            };
          };

          var getArray = function getArray(
            T,
            A,
            len,
            getItem,
            isIterator,
            mapFn
          ) {
            // 16. Let k be 0.
            var k = 0;

            // 17. Repeat, while k < len… or while iterator is done (also steps a - h)
            while (k < len || isIterator) {
              var item = getItem(k);
              var kValue = isIterator ? item.value : item;

              if (isIterator && item.done) {
                return A;
              } else {
                if (mapFn) {
                  A[k] =
                    typeof T === "undefined"
                      ? mapFn(kValue, k)
                      : mapFn.call(T, kValue, k);
                } else {
                  A[k] = kValue;
                }
              }
              k += 1;
            }

            if (isIterator) {
              throw new TypeError(
                "Array.from: provided arrayLike or iterator has length more then 2 ** 52 - 1"
              );
            } else {
              A.length = len;
            }

            return A;
          };

          // The length property of the from method is 1.
          return function from(arrayLikeOrIterator /*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            var C = this;

            // 2. Let items be ToObject(arrayLikeOrIterator).
            var items = Object(arrayLikeOrIterator);
            var isIterator = isCallable(items[symbolIterator]);

            // 3. ReturnIfAbrupt(items).
            if (arrayLikeOrIterator == null && !isIterator) {
              throw new TypeError(
                "Array.from requires an array-like object or iterator - not null or undefined"
              );
            }

            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== "undefined") {
              // 5. else
              // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
              if (!isCallable(mapFn)) {
                throw new TypeError(
                  "Array.from: when provided, the second argument must be a function"
                );
              }

              // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
              if (arguments.length > 2) {
                T = arguments[2];
              }
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength(items.length);

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method
            // of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);

            return getArray(
              T,
              A,
              len,
              setGetItemHandler(isIterator, items),
              isIterator,
              mapFn
            );
          };
        })();
      }

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
            selectedAmt = $(
              'input[name="transaction.donationAmt.other"]'
            ).val();
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
      var selectedAmt = $(
        'input[name="transaction.donationAmt"]:checked'
      ).val();

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
            selectedAmt = $(
              'input[name="transaction.donationAmt.other"]'
            ).val();
          }
          //calculate the selected amount
          calc = (selectedAmt * selectedRate) / currentLangRate;
        }

        //Default output when the dropdown has been selected
        conversionRate(currentLangRate, selectedAmt, calc, this.value);
      }
    );

    $(document).on(
      "click",
      'input[name="transaction.donationAmt"]',
      function() {
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
      }
    );

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
  }
}
