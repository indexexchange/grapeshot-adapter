/**
 * @author:    Partner
 * @license:   UNLICENSED
 *
 * @copyright: Copyright (c) 2017 by Index Exchange. All rights reserved.
 *
 * The information contained within this document is confidential, copyrighted
 * and or a trade secret. No part of this document may be reproduced or
 * distributed in any form or by any means, in whole or in part, without the
 * prior written permission of Index Exchange.
 */

'use strict';

////////////////////////////////////////////////////////////////////////////////
// Dependencies ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var Browser = require('browser.js');
var Classify = require('classify.js');
var Constants = require('constants.js');
var Network = require('network.js');
var Partner = require('partner.js');
var Prms = require('prms.js');
var SpaceCamp = require('space-camp.js');
var System = require('system.js');
var Utilities = require('utilities.js');
var EventsService;
var RenderService;

//? if (DEBUG) {
var PartnerSpecificValidator = require('grapeshot-nob-validator.js');
var Scribe = require('scribe.js');
var Whoopsie = require('whoopsie.js');
//? }

////////////////////////////////////////////////////////////////////////////////
// Main ////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Partner module template
 *
 * @class
 */
function GrapeshotNob(configs) {
    /* =====================================
     * Data
     * ---------------------------------- */

    /* Private
     * ---------------------------------- */

    /**
     * Reference to the partner base class.
     *
     * @private {object}
     */
    var __baseClass;

    /**
     * Profile for this partner.
     *
     * @private {object}
     */
    var __profile;

    /* =====================================
     * Functions
     * ---------------------------------- */

    /* Utilities
     * ---------------------------------- */

    /**
     * Generates the request URL and query data to the endpoint for the xSlots
     * in the given returnParcels.
     *
     * @param  {object[]} returnParcels
     *
     * @return {object}
     */
    function __generateRequestObjs(inParcels) {

        /* =============================================================================
         * STEP 2  | Generate Request URL
         * -----------------------------------------------------------------------------
         *
         * Generate the URL to request demand from the partner endpoint using the provided
         * inParcels. inParcels is an array of objects each object containing an .htSlot 
         * which is a reference to the Header Tag Slot object from the wrapper configuration.
         * If your partner makes slot-level requests, your configuration should contain
         * a mapping from Header Tag Slot names (call htSlot.getName()) to the partner-specific
         * information for your concept of slots (caled 'xSlots').
         * If your partner only deals with page-level requests, you can likely ignore
         * the slot information and simply formulate an appropriate network request.
         *
         * Return objects containing:
         * queryUrl: the url for the request
         * data: the query object containing a map of the query string paramaters
         *
         * The return object should look something like this:
         * {
         *     url: 'http://bidserver.com/api/bids' // base request url for a GET/POST request
         *     data: { // query string object that will be attached to the base url
         *        slots: [
         *             {
         *                 placementId: 54321,
         *                 sizes: [[300, 250]]
         *             },{
         *                 placementId: 12345,
         *                 sizes: [[300, 600]]
         *             },{
         *                 placementId: 654321,
         *                 sizes: [[728, 90]]
         *             }
         *         ],
         *         site: 'http://google.com'
         *     },
         *     callbackId: '_23sd2ij4i1' //unique id used for pairing requests and responses
         * }
         *
         * If you need to make multiple network requests, create a separate object for each
         * one and add them all to the returned array.
         */

        /* ---------------------- PUT CODE HERE ------------------------------------ */
        var queryObj = {};
        var callbackId = System.generateUniqueId();

        /* Change this to your bidder endpoint.*/
        var baseUrl = Browser.getProtocol() + '//someAdapterEndpoint.com/bid';

        /* ---------------- Craft bid request --------------------------------------- */


        /* -------------------------------------------------------------------------- */

        return [{
            url: baseUrl,
            data: queryObj
        }];
    }

    /* Helpers
     * ---------------------------------- */

    /**
     * Parses and extracts demand from adResponse according to the adapter and then attaches it
     * to the corresponding bid's returnParcel in the correct format using targeting keys.
     *
     * @param {string} sessionId The sessionId, used for stats and other events.
     *
     * @param {any} adResponse This is the bid response as returned from the bid request.
     *
     * @param {object[]} returnParcels The array of parcels which will be returned to the
     *                                 wrapper after parsing. Add new parcels with targeting
     *                                 to set here.
     */
    function __parseResponse(sessionId, adResponse, returnParcels) {

        /* =============================================================================
         * STEP 4  | Parse response
         * -----------------------------------------------------------------------------
         *
         * From the ad response provided, create parcels and add them into the
         * returnParcels array.
         *
         * The parcels you create must contain, at minimum, the following:
         *
         * parcel = {
         *     partnerId: __profile.partnerId,
         *     partnerStatsId: __profile.statsId,
         *     targetingType: 'page' or 'slot',
         *     targeting: {
         *         (key1): ['value1', 'value2', ...],
         *         ...
         *     }
         * }
         *
         * If you need to set page-level targeting, create a parcel as above with the
         * targetingType set to 'page' and add it to the returnParcels array.
         *
         * For slot-level targeting, set targetingType to 'slot'. For slot-level
         * targeting, each parcel must also include the following information in order
         * to identify the slot in question:
         *
         * parcel = {
         *     (properties above),
         *     htSlot: (the header tag slot object passed in in the corresponding inParcel),
         *     xSlotName: (a string identifier for your partner slot, from your config),
         *     xSlotRef: (a reference to the object defining the slot in your config),
         *     ref: (the value passed as the 'ref' property in the corresponding inParcel,
         *           this will generally be a reference to a google slot object)
         * }
         *
         * If your module does not need to set any targeting, you do not need to add
         * anything into the returnParcels array.
         *
         * Do not set targeting directly on the provided ref value or call any GPT
         * library functions.
         */

    }

    function __sendDemandRequest(sessionId, requestObj) {
         /* =============================================================================
         * STEP 1  | Send network request
         * -----------------------------------------------------------------------------
         *
         * Customize this function as necessary to send a request to your endpoint using
         * the information from __generateRequestObjs
         */

        var returnParcels = [];
        
        var requestId = '_' + System.generateUniqueId();

        var xSlotNames = {};

        if (__profile.enabledAnalytics.requestTime) {

            if (__profile.targetingType === 'slot') {

                /* 
                 * Fill the xSlotNames object
                 *
                 * If you are sending slot-specific requests to your endpoint and you want
                 * to collect stats from the wrapper, you must fill the xSlotNames object
                 * here to keep track of which slots go with which Header Tag Slots for
                 * the request.
                 *
                 * Using the request information, fill the xSlotNames object as follows:
                 *
                 * xSlotNames = {
                 *     (requestId): {
                 *         (htSlotName1): [xSlotName1, xSlotName2, ...],
                 *         (htSlotName2): [xSlotName3, xSlotName4, ...],
                 *         ...
                 *     }
                 * }
                 *
                 * You can then use this object as a parameter to __baseClass._emitStatsEvent
                 * to send stats events in bulk for all the slots in the object.
                 */

                xSlotNames[requestId] = {
                    /* ... */
                };

                __baseClass._emitStatsEvent(sessionId, 'hs_slot_request', xSlotNames);
            } else if (__profile.targetingType === 'page') {
                EventsService.emit('hs_page_request', {
                    sessionId: sessionId,
                    statsId: __profile.statsId,
                    requestId: requestId,
                });
            }
        }

        return new Prms(function (resolve) {
            EventsService.emit('partner_request_sent', {
                partner: __profile.partnerId,
                //? if (DEBUG) {
                parcels: returnParcels,
                request: requestObj
                //? }
            });

            Network.ajax({
                url: requestObj.url,
                data: requestObj.data,
                method: 'GET',
                timeout: __baseClass._configs.timeout,
                withCredentials: true,
                sessionId: sessionId,
                globalTimeout: true,

                //? if (DEBUG) {
                initiatorId: __profile.partnerId,
                //? }

                onSuccess: function (responseText) {
                    var responseObj;
                    var requestStatus = 'success';

                    try {
                        responseObj = JSON.parse(responseText);

                        __parseResponse(sessionId, responseObj, returnParcels, xSlotNames);
                    } catch (ex) {
                        EventsService.emit('internal_error', __profile.partnerId + ' error parsing demand: ' + ex, ex.stack);

                        requestStatus = 'error';

                        if (__profile.enabledAnalytics.requestTime) {
                            if (__profile.targetingType === 'slot') {
                                __baseClass._emitStatsEvent(sessionId, 'hs_slot_error', xSlotNames);
                            } else if (__profile.targetingType === 'page') {
                                EventsService.emit('hs_page_error', {
                                    sessionId: sessionId,
                                    statsId: __profile.statsId,
                                    requestId: requestId,
                                });
                            }
                        }
                    }

                    EventsService.emit('partner_request_complete', {
                        partner: __profile.partnerId,
                        status: requestStatus,
                        //? if (DEBUG) {
                        parcels: returnParcels,
                        request: requestObj
                        //? }
                    });
                    resolve(returnParcels);
                },

                onTimeout: function () {
                    EventsService.emit('partner_request_complete', {
                        partner: __profile.partnerId,
                        status: 'timeout',
                        //? if (DEBUG) {
                        parcels: returnParcels,
                        request: requestObj
                        //? }
                    });

                    if (__profile.enabledAnalytics.requestTime) {
                        if (__profile.targetingType === 'slot') {
                            __baseClass._emitStatsEvent(sessionId, 'hs_slot_timeout', xSlotNames);
                        } else if (__profile.targetingType === 'page') {
                            EventsService.emit('hs_page_timeout', {
                                sessionId: sessionId,
                                statsId: __profile.statsId,
                                requestId: requestId,
                            });
                        }
                    }

                    resolve(returnParcels);
                },

                onFailure: function () {
                    EventsService.emit('partner_request_complete', {
                        partner: __profile.partnerId,
                        status: 'error',
                        //? if (DEBUG) {
                        parcels: returnParcels,
                        request: requestObj
                        //? }
                    });

                    if (__profile.enabledAnalytics.requestTime) {
                        if (__profile.targetingType === 'slot') {
                            __baseClass._emitStatsEvent(sessionId, 'hs_slot_error', xSlotNames);
                        } else if (__profile.targetingType === 'page') {
                            EventsService.emit('hs_page_error', {
                                sessionId: sessionId,
                                statsId: __profile.statsId,
                                requestId: requestId,
                            });
                        }
                    }

                    resolve(returnParcels);
                }
            });
        });
    }

    /* send requests for all slots in inParcels */
    function __retriever(sessionId, inParcels) {
        var requestObjs = __generateRequestObjs(inParcels);
        var demandRequestPromises = [];

        for (var i = 0; i < requestObjs.length; i++) {
            demandRequestPromises.push(__sendDemandRequest(sessionId, requestObjs[i]));
        }

        return demandRequestPromises;
    }

    /* =====================================
     * Constructors
     * ---------------------------------- */

    (function __constructor() {
        EventsService = SpaceCamp.services.EventsService;
        RenderService = SpaceCamp.services.RenderService;

        /* =============================================================================
         * STEP 1  | Partner Configuration
         * -----------------------------------------------------------------------------
         *
         * Please fill out the below partner profile according to the steps in the README doc.
         */

        /* ---------- Please fill out this partner profile according to your module ------------*/
        __profile = {
            partnerId: 'GrapeshotNob', // PartnerName
            namespace: 'GrapeshotNob', // Should be same as partnerName
            statsId: 'GRAPE', // Unique partner identifier
            version: '2.0.0',
            targetingType: 'slot',
            enabledAnalytics: {
                requestTime: true
            },
            features: {
                demandExpiry: {
                    enabled: false,
                    value: 0
                },
                rateLimiting: {
                    enabled: false,
                    value: 0
                }
            },
            targetingKeys: { 
                /*
                 * Define all targeting keys that your module will need to set here.
                 *
                 * These can be overridden by the per-publisher wrapper configuration. 
                 * Access them elsewhere in this partner module under 
                 * __baseClass._configs.targetingKeys
                 *
                 * eg. to set the id key defined in the defaults below, you would refer to
                 * __baseClass._configs.targetingKeys.id
                 */

                id: 'ix_grape_id',
                om: 'ix_grape_cpm',
                pm: 'ix_grape_cpm',
                pmid: 'ix_grape_dealid'
            },
            lineItemType: Constants.LineItemTypes.ID_AND_SIZE,
            callbackType: Partner.CallbackTypes.NONE, // Callback type, please refer to the readme for details
            architecture: Partner.Architectures.SRA, // Request architecture, please refer to the readme for details
            requestType: Partner.RequestTypes.ANY // Request type, jsonp, ajax, or any.
        };
        /* ---------------------------------------------------------------------------------------*/

        //? if (DEBUG) {
        var results = PartnerSpecificValidator(configs);

        if (results) {
            throw Whoopsie('INVALID_CONFIG', results);
        }
        //? }
        
        /* =============================================================================
         * Required Resources
         * -----------------------------------------------------------------------------
         *
         * If your partner module requires any external scripts, add their URLs into the
         * requiredResources array.
         */
        var requiredResources = [];
        /* ---------------------------------------------------------------------------------------*/

        __baseClass = Partner(__profile, configs, requiredResources, {
            retriever: __retriever
        });
    })();

    /* =====================================
     * Public Interface
     * ---------------------------------- */

    var derivedClass = {
        /* Class Information
         * ---------------------------------- */

        //? if (DEBUG) {
        __type__: 'GrapeshotNob',
        //? }

        //? if (TEST) {
        __baseClass: __baseClass,
        //? }

        /* Data
         * ---------------------------------- */

        //? if (TEST) {
        profile: __profile,
        //? }

        /* Functions
         * ---------------------------------- */

        //? if (TEST) {
        parseResponse: __parseResponse,
        generateRequestObjs: __generateRequestObjs
        //? }
    };

    return Classify.derive(__baseClass, derivedClass);
}

////////////////////////////////////////////////////////////////////////////////
// Exports /////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

module.exports = GrapeshotNob;