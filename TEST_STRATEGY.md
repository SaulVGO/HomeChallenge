## Out of scope

- Validating anything that depends on external systems due to integration complexity.
- CAPTCHA validation since the main purpose is to stop bots

## CAPTCHA HANDLING

CAPTCHA needs to be handle in test environments where it can be deactivated. If possible answer can be mocked and separate the functional flow from the anti-bot.

## Flakiness risks

While using playwright locators is suggested in the documentation, there are some cases where the use of xpath or css selectors is required. When the IDs, name or attributes are dynamic, locating them with querySelector has been succesful.
Need to implement validations like "isVisible", "isEnabled" before next step to avoid get empty arrays or data. An empty array is not a failing test but could be due to elements not loaded in the DOM.

## Adding test to suite

I will add required tags to the test so it can run in smoke or regression or any other specified flow. 
Check if locators already exists and replace them.
Optimize the test using existing functions.