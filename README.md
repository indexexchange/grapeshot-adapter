# Table of Contents
1. [Introduction](#intro)
    * [Repository Structure](#Repository)
    * [Getting Started](#gettingStarted)
2. [Partner Requirements and Guidelines](#requirements)
3. [Partner Module Overview](#overview)
    * [Configuration](#configuration)
    * [Event Model](#eventModel)
    * [Creating a Partner Module](#creatingPartnerModule)
4. [Utility Libraries](#helpers)
    * [Utils](#utils)
    * [Network](#network)
    * [BidRoundingTransformer](#bidRounding)
5. [Testing](#testing)
    * [Basic Tests](#basictests)
    * [Writing Additional Tests](#additional)

# <a name='intro'></a>Introduction

<b>Welcome to the Index Exchange Partner Certification Process! </b>

Below you will find everything you need to complete the certification process and be a part of the Header Tag Wrapper!

This section describes how to create a non-bidding partner module. A non-bidding partner module is one that does not participate directly in the auction or provide any ads to display. It may provide targeting to set on a slot level or page level, or both.

## <a name='Repository'></a>Repository Structure
* `README.md` - This is the main documentation file which should contain everything you need to complete the certification process. If anything is unclear, please refer to this document first.
* `grapeshot-nob.js` - This is your partner module file, by default it contains a template divided into multiple sections which need to be completed.
* `grapeshot-nob-validator.js` - This is the validator file for the configuration object that will be passed into your module.

##  <a name='gettingStarted'></a>Getting Started
1. <b>Complete the grapeshot-nob.js file </b>
    * grapeshot-nob.js is where all of your adapter code will live.
    * In order to complete the partner module correctly, please refer to the [Partner Module Overview](#overview) and the [Utility Libraries](#helpers) sections.
    * <b>Please refer to the [Partner Requirements and Guidelines](#requirements) when creating your module. Ensure requirements are met to streamline the review process.</b>
2. <b>Complete the grapeshot-nob-validator.js file</b>
    * This file is where your partner-specific configurations will need to be validated.
    * Things like type and null checks will be done here.
3. <b> Create & Run Unit tests for your module</b>
    * You should create specific unit tests in the spec folder with actual values based on mock ad responses to confirm that your module is working as expected.
    * Please refer to the [Testing](#testing) section below for more information.
4. <b>Submitting for Review</b>
    * Once the module has been verified submit a pull request from the `development-v2`branch to the `master-v2` branch for the Index Exchange team to review. If everything is approved, your adapter will be officially certified!

# <a name='requirements'></a> Partner Requirements & Guildelines
In order for your module to be successfully certified, please refer to the following list of requirements and guidelines.
Items under required <b><u>must</b></u> be satisfied in order to pass the certification process. Items under guidelines are recommended for an optimal setup and should be followed if possible.

### General

#### Required
* The only targeting keys that can be set are predetermined by Index. The partner module should not set targeting on other keys.
* Must support the following browsers: IE 10+, Edge, Chrome, Safari, and Firefox

#### Recommended
* Please use our helper libraries when possible. Refer to our [Utility Libraries](#helpers) documentation below. All of the utility functions in this library are designed to be backwards compatible with supported browsers to ease cross-browser compatibility.

### Request Endpoint

#### Required
* Must provide cache busting parameter. Cache busting is required to prevent network caches.
* Partner endpoint domain must be consistent. Load balancing should be performed by the endpoint.
* Your endpoint should support HTTPS requests. When wrapper loads in secure pages, all requests need to be HTTPS. If you're unable to provide a secure endpoint, we will not be able to make requests to your ad servers.

#### Recommended;
* Your module should support a single request architecture (SRA) which has a capability to send multiple bid requests in a single HTTP request.
* Partner should use AJAX method to make bid requests. Please use our [Network](#network) utility library for making network requests, particularly the `Network.ajax` method. This ensures the requests will work with all browsers.

### DFP Setup

#### Required
* DFP line items, creatives, and render functions will be set up by the Index Exchange team.
<br><br>

# <a name='overview'></a> Partner Module Overview

## <a name='configuration'></a>Prelude: Configuration & Parcels

The Header Tag Wrapper passes each partner a configuration object that has been configured based on a publisher's website. This object contains all the configuration information required for the wrapper, including partner-specific slot mappings, timeouts, and any other partner-specific configuration.
The partner-specific slot mappings dictate how ad slots on the page will map to partner-specific configuration.
There are 2 concepts to be familiar with when understanding how slots on the page are mapped back to partner-specific configuration. Header Tag Slots, which are referred to as htSlots, and partner-specific slot configuration, which is called xSlots in the codebase.
* htSlots - This is an abstraction of the googletag.slot object.
  * The set of available htSlots is configured elsewhere in the wrapper and is shared by all partner modules. 
  * These will need to be mapped to xSlots in the configuration object and in the partner module's code.
* xSlots - These are also an abstraction for partner-specific configuration that will be mapped to htSlots.
  * These represent a single partner-specific configuration.
  * An xSlot is how a partner can map their ad server specific identifiers (placementIDs, siteIDs, zoneIDs, etc) to the `htSlot` object.
  * It can represent a single or multiple sizes.
  * Multiple xSlots can be mapped to the same htSlot.
  * Multiple htSlots can have the same xSlot in their mappings.

Example Partner Configuration Mapping
```javascript
{
    "partners": {
        "GrapeshotNob": {
            "enabled": true,
            "configs": {
                "publisherId": "abc123",
                "xSlots": {
                    "xSlot1": {
                        "placementID": "123"
                    },
                    "xSlot2": {
                        "placementID": "345"
                    }
                },
                "mapping": {
                    "htSlotID-1": [ "xSlot1" ],
                    "htSlotID-2": [ "xSlot2" ]
                }
            }
        }
    }
}
```

When the wrapper initiates an auction, <i>Parcels</i> will be generated for every htSlot which is currently active on the page. Parcels are objects that carry different kinds of information throughout the wrapper. In the context of the adapter, parcels are the input into your adapter. Parcels carry information regarding which slots on the publisher's page need demand. More specifically each parcel contains an htSlot object reference. If your adapter gets slot-level demand, it should use the values returned by htSlot.getName() as the index into the mapping object in your config.

Each parcel passed to your adapter is an object in the following form:

```javascript
{
    "htSlot": {
      "__type__": "HeaderTagSlot"
    },
    "ref": "googletag.Slot",      // reference to the slot on the page, in this example it is a googletag slot
}
```

These parcels will be fed into the `__retriever` function of your partner module. This function must return an array of promises, one for each network request your module makes. Each promise will resolve with an array of new parcel objects providing the result of your partner's network call.

The parcels returned by your adapter are objects in the following form:

```javascript
{
    "htSlot": {     // The same htSlot object from the parcel you were given
      "__type__": "HeaderTagSlot"
    },
    "ref": "googletag.Slot",      // reference to the slot on the page, also from the parcel you were given
    "partnerId": __profile.partnerId,
    "partnerStatsId": __profile.statsId,
    "targetingType": "page" or "slot",
    "targeting": {      // The targeting to be set, if any
        "key1": ["value1", "value2", ...],
        "key2": [...]
    }
}
```

The targeting you provide in the `targeting` member of each parcel you return will be set by the wrapper before calling DFP. Your adapter must not set any targeting directly.
If the `targetingType` member is set to `"slot"` then the targeting will be set only on the slot identified by the `htSlot` and `ref` members. For targeting multiple slots, return multiple parcels.
If the `targetingType` member is set to `"page"` then the targeting will be set at page-level. The `htSlot` and `ref` members are not necessary for page-level targeting parcels, and if present will be ignored.
Your adapter may return both page-level and slot-level parcels, if desired.
If you have no targeting to set, you may resolve your promises with parcels with empty targeting objects, or with empty arrays (ie. no parcels at all). Your promises must always be resolved. Resolving your promise is the signal to the wrapper that your adapter has finished its work.

## <a name='eventModel'></a> High Level Event Model

1. The Header Tag Wrapper script tag is loaded on the page.
2. Wrapper specific configuration validation is performed.
3. All the partner modules are instantiated.
    * Partner-specific configuration validation is performed - checking that all the required fields are provided and that they are in the correct format.
4. An external request for demand is made to the wrapper. This can be via a googletag display or refresh call, or by other methods depending on the wrapper product in use.
The wrapper requests demand from the partner modules for the required slots (provided in the form of parcels).
    * The wrapper calls `__retriever(inParcels)` for every partner module.
    * The adapter makes its network call(s) and parses the response(s)
    * The adapter creates an array retunParcels containing parcel objects with any targeting which should be set
    * The returnParcels are then sent back to the wrapper.
5. The wrapper applies targeting using the demand from the returnParcels.

## <a name='creatingPartnerModule'></a> Creating a Partner Module

In this section you will be filling out the grapeshot-nob.js, grapeshot-nob-exports.js, and the grapeshot-nob-validator.js files to create your module.

### Step 0: Config Validation (`grapeshot-nob-validator.js`)
Before you get started on writing the actual code for your module, you need to figure out what your partner configuration (refer to [Configuration](#configuration)) object will look like. This is crucial because it will determine the input (parcels) to your module's core functions.

Once you have a basic idea of what this will look like, and how you will uniquely identify each slot on your server (via xSlot placementId or other inventory codes) you will need to validate this configuration. This validation will be performed by the wrapper using the `grapeshot-nob-validator.js` file.

The `grapeshot-nob-validator.js` file contains a single export, a `partnerValidator` function, that takes in the configuration object that will be fed to your module's constructor (refer to [Configuration](#configuration) for an example layout) and validates it via type checks. The type checks are performed using an external library called `schema-inspector`, for which the documentation can be found here https://github.com/Atinux/schema-inspector.

We have provided a very basic validation schema in `grapeshot-nob-validator.js` that is based off of the example `mockPartnerConfig.js` object found in the `spec/support` directory for testing (refer to the [Testing](#testing) section for the testing structure).

Once you have filled this file out, you can continue actually writing your module!

### Step 1: Partner Configuration (`grapeshot-nob.js`)
This section involves setting up the general partner configuration such as name, default pricing strategy as well as the general format of incoming/outgoing bids for the adapter. Please read the following descriptions and update the `__profile` variable if necessary.

* <u>partnerId</u> - This is simply the name of our module, generally if your module is a bidder the name will end with Nob. The format of the name should be PartnerName{Type}.
* <u>namespace</u> - Should be the same as partnerId, it is the namespace that is used internally to store all of variables/functions related to your module, i.e. adResponseCallbacks.
* <u>statsId</u> - A unique identifier used for analytics that will be provided for you.
* <u>version</u> - If this is the first iteration of your module, please leave this field at 2.0.0.
* <u>targetingType</u> - The targeting type of your bidder, the default is slot for slot level targeting but could also be page.
* <u>enabledAnalytics</u> - The analytics that the wrapper will track for the module. requestTime is the only currently supported analytic, which records different times around when bid requests occur.
* <u>features</u> - Extra features that a partner can support
    * <u>demandExpiry</u> - Setting an expiry time on the demand that partner returns.
    * <u>rateLimiting</u> - Used for limiting the amount of requests to a given partner for a given slot on pages that support rate limiting in dfp.
* <u>targetingKeys</u> - Different targeting keys that will be used to record demand for a given parcel.
    * <u>id</u> - This key will be used to trace back the creative that has won in dfp for rendering.
    * <u>om</u> - This key signals the open market bid in cpm.
    * <u>pm</u> - This key signals the private market bid in cpm.
    * <u>pmid</u> - This key signals the private market deal id.
* lineItemType, callbackType, architecture, requestType:
    * These properties are required by standard bidding partner modules. The wrapper's validation requires that they be present, but for a non-bidding partner you can leave them as their default values and ignore them.

### Step 2: Generate Request URL (`grapeshot-nob.js`)
This step is for crafting a bid request url given a specific set of parcels.

For this step, you must fill out the `generateRequestObjs(inParcels)` function. This function takes in the array of parcels from the wrapper.
These are the parcel objects that contain the different slots for which demand needs to be requested.

Using this array of parcels, the adapter must craft an array of request objects that will be used to send out the network requests for these slots. These objects must contain the request URL, an object containing query parameters, and a callbackId. Each object corresponds to a single network request. If your endpoint is SRA, this array should be of length 1.

The final returned object should looks something like this:
```javascript
{
    url: 'http://bidserver.com/api/bids' // base request url for a GET/POST request
    data: { // query string object that will be attached to the base url
        slots: [
            {
                placementId: 54321,
            },{
                placementId: 12345,
            },{
                placementId: 654321,
            }
        ],
        site: 'http://google.com'
    },
    callbackId: '_23sd2ij4i1' //unique id used for pairing requests and responses
}
```

More information can be found in the comment section of the function itself.

### Step 3: Sending Response (`grapeshot-nob.js`)
This function takes a single one of the objects from the previous step and sends the network request to your endpoint. Customize it as needed.

### Step 4: Parsing Response (`grapeshot-nob.js`)
In this step the adapter must parse the response from your endpoint and create returnParcels objects.
The returnParcels parameter will be an array passed in from the `__sendDemandRequest` function, probably empty. Fill it with any number of new return parcels providing the targeting to set.

# <a name='helpers'></a> Utility Libraries
There are a lot of helper objects available to you in you partner module.

### Utilities
* `isObject(entity)` - Return true if entity is an object.
* `isArray(obj)` - Return true if obj is an array.
* `isNumber(entity)` - Return true if entity is a number.
* `isString(entity)` - Return true if entity is a string.
* `isBoolean(entity)` - Return true if entity is a boolean.
* `isFunction(entity)` - Return true if entity is a function.
* `isRegex(entity)` - Return true if entity is regex.
* `isEmpty(entity)`
    * if entity is a string, return true if string is empty.
    * if entity is an object, return true if the object has no properties.
    * if entity is an array, return true if the array is empty.
* `arrayDelete(arr, value)` - Delete given value from an object or array.
* `randomSplice(arr)` - Returns a randomly spliced item from an array.
* `deepCopy(entity)` - Return a deep copy of the entity.
* `mergeObjects(entity1, entity2, ...)` - Takes the first entity and overwrites it with the next entity, returning the final object.
* `mergeArrays(arr1, arr2, ...)` - Merge all of the specified arrays into one and return it.
* `tryCatchWrapper(fn, args, errorMessage, context)` - Wrap the given arguments into a try catch block. Returning a function.
* `isArraySubset(arr1, arr2, matcher)` - Return true if `arr1` is a subset of `arr2`.

### System
* `now()` - Return the number of milliseconds since 1970/01/01.
* `generateUniqueId(len, charSet)` - Creates a unique identifier of the given length using the optionally specified charset:
    * `ALPHANUM`: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    * `ALPHA`: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    * `ALPHA_UPPER`: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    * `ALPHA_LOWER`: 'abcdefghijklmnopqrstuvwxyz',
    * `NUM`: '0123456789'
* `getTimezoneOffset()` - Returns the timezone offset.
* `documentWrite(doc, data)` - doc.write the data using the specified document `doc`.

### Size
* `arrayToString(arr)` - Returns the string representation of an array in the form of '300x250'.
* `stringToArray(str)` - Return the array rep representation of a string in the form of [300, 250].

### Browser
* `getProtocol(httpValue, httpsValue)` - Return `document.location.protocol` or `httpValue` if `document.location.protocol` is http and `httpsValue` if `document.location.protocol` is https.
* `isLocalStorageSupported()` - Checks if local storage is supported.
* `getViewportWidth()` - Return viewport width.
* `getViewportHeight()` - Return viewport height.
* `isTopFrame()` - Checks to see if the code is being run in the top frame or iframe.
* `getScreenWidth()` - Returns screen.width.
* `getScreenHeight()` - Returns screen.height.
* `getReferrer()` - Return document.referrer.
* `getPageUrl()` - Return the page's url.
* `getHostname()` - Return the page's hostname.
* `getNearestEntity(entityName)` - Returns the entity with `entityName` in the nearest `window` scope.
* `createHiddenIFrame(srcUrl, scope)` - Generate a hidden iframe and then append it to the body. Use the `srcUrl` and `scope` if provided.

### <a name='deviceTypeChecker'></a> DeviceTypeChecker
* `getDeviceType()` - Returns the device type.

### <a name='bidRounding'></a> BidRoundingTransformer
* `transformBid(rawBid)` - Transform rawBid into the configured format. This includes, rounding/flooring according to the bidTransformConfig that was used to instantiate the library. The bidTransformConfig is an object of the format:
    * `floor` - Minimum acceptable bid price.
    * `inputCentsMultiplier` - Multiply input bids by this to get cents.
    * `outputCentsDivisor` -  Divide output bids in cents by this.
    * `outputPrecision` - Decimal places in output.
    * `roundingType` - Should always be 1.
    * `buckets` - Buckets specifying rounding steps.

Example of `bidTransformConfig`:

```javascript
var bidTransformConfig = {          // Default rounding configuration
    'floor': 0,
    'inputCentsMultiplier': 100,    // Input is in dollars
    'outputCentsDivisor': 100,      // Output as dollars
    'outputPrecision': 2,           // With 2 decimal places
    'roundingType': 1,              // Floor instead of round
    'buckets': [{
        'max': 2000,                // Up to 20 dollar (above 5 cents)
        'step': 5                   // use 5 cent increments
    }, {
        'max': 5000,                // Up to 50 dollars (above 20 dollars)
        'step': 100                 // use 1 dollar increments
    }]
};
```


