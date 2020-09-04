# PETA Latino Currency Conversion Rate
Frontend for the conversion rate for PETA latino donation form

## Features
- Creates a dropdown containing the list of currencies
- Displays the information when the user selects a currency in the dropdown
- Calculates the currency from USD to the selected currency based on the selected amount or input
- Keeps the inputted amount when the currency has changed in the dropdown

## Usage
- Add the script tag in the HTML file in the PETA latino donation form
```html
<script async type="text/javascript" src="/src/js/conversionfile.js"></script>
```

## Deployment

Will update when the deployment is known

# Future Update

## Replace URL

- Replace the URL in `url: cachAPI.php` in the `conversionfile.js` with the URL of the cache API when it has been deployed in the AWS

```html
    $.ajax({
        type: 'get',
        url: 'cacheAPI.php',
        dataType: 'JSON',
        success: function (res) {
            appendConverter(res);
        },
        //Could not get fixer.io API
        error: function (res) {
            console.error(res.responseText);
        }
    });
```