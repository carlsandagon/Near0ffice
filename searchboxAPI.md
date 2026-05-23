# Search Box API

The **Mapbox Search Box API** is the easiest way to add interactive location search to connected cars, micro-mobility services, delivery apps, and more. Search Box API supports interactive location search or stand-alone queries to search addresses, places, and points of interest.

> **Related content (playground): [Search Box API Developer Playground](https://docs.mapbox.com/playground/search-box/)**
> 
> Try Search API queries and see the results on a map.

> **Related content (guide): [Japan-specific considerations for the Search Box API](https://docs.mapbox.com/help/troubleshooting/japan-specific-considerations-search-api/)**
> 
> Learn how to use Search Box API for Japanese-language searches for Japanese locations.

> **Note: Client Libraries and SDKs**
> 
> Mapbox search client libraries and SDKs combine the power of the Search Box API with a ready-to-use interactive search UI. Learn how to add robust location search to your web or mobile application:
> 
> -   Mapbox Search JS for [Web](https://docs.mapbox.com/mapbox-search-js/guides/search/web/) or [React](https://docs.mapbox.com/mapbox-search-js/guides/search/react/) or [Node](https://docs.mapbox.com/mapbox-search-js/api/core/search/)
> -   [Mapbox Search SDK for Android](https://docs.mapbox.com/android/search/guides/get-started/)
> -   [Mapbox Search SDK for iOS](https://docs.mapbox.com/ios/search/guides/install/)

## Search Box API Endpoints

The Search Box API includes following endpoints to support various location search use cases:

-   `/suggest` and `/retrieve` endpoints are used together to build an [Interactive Search with Autocomplete](#interactive-search) for your app.
-   `/forward` endpoint is used to create a [Search Request for Text Search](#search-request)
-   `/category` endpoint is used to create a [Category Search](#category-search)
-   `/reverse` endpoint is used to create a [Reverse lookup](#reverse-lookup)

## Interactive Search (Autocomplete)

With the Search Box API, developers can create an autocomplete search experience that makes it easier for users to find not only addresses, but also points of interest (POIs), categories of POIs, street names, neighborhoods, localities, place names, districts, postcodes, regions, and countries.

> **Related content (playground): [Search Box API User Demo](https://labs.mapbox.com/sbs-playground/)**
> 
> Try Search Box API powered interactive search on a map.

The `/suggest` endpoint is used in combination with the `/retrieve` endpoint to create an interactive search experience for end users. Within your application, send user search queries to the `/suggest` endpoint to get suggested results for the given search query.

When a user selects a result on the application UI, you should trigger a `/retrieve` request to get detailed information about the selection.

### Get suggested results

**GET** : `https://api.mapbox.com/search/searchbox/v1/suggest?q={search_text}`

This endpoint provides a list of suggested search results for the user query. This endpoint, along with the [`/retrieve` endpoint](#retrieve-a-suggested-feature), can be used to add autocomplete search functionality to your applications.

<table><thead><tr><th>Required parameters</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td><code>q</code></td><td><code>string</code></td><td>The user's query string. The query is limited to 256 characters.</td></tr><tr><td><code>session_token</code></td><td><code>string</code></td><td>A customer-provided session token value, which groups a series of requests together for <a href="#search-box-api-pricing">billing purposes</a>. <a href="https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)">UUIDv4</a> is recommended. For more information on how <code>session_token</code> is used to group Search API calls into one session, see the <a href="#session-billing">Session-based pricing</a> section of this documentation.<br><br>Each concurrent session must use a distinct <code>session_token</code> value.</td></tr><tr><td><code>access_token</code></td><td><code>string</code></td><td>A valid Mapbox <a href="/guides/#access-tokens-and-token-scopes">access token</a>.</td></tr></tbody></table>

You can further refine the results of a query to this endpoint with the following optional parameters:

| Optional parameters | Type | Description |
| --- | --- | --- |
| `language` | `string` | The ISO language code to be returned. If not provided, the default is English. |
| `limit` | `integer` | The number of results to return, up to 10. |
| `proximity` | `string` | Bias the response to favor results that are closer to a specific location. Provide either `ip` to get results closest to the user's IP location or provide two comma-separated coordinates in `longitude,latitude` order. If not provided, the default is IP proximity. When both `proximity` and `origin` are provided, `origin` is interpreted as the target of a route, while `proximity` indicates the current user location. |
| `bbox` | `string` | Limit results to only those contained within the supplied bounding box. Bounding boxes should be supplied as four numbers separated by commas, in `minimum longitude`,`minimum latitude`,`maximum longitude`,`maximum latitude` order. The bounding box cannot cross the 180th meridian. |
| `country` | `string` | A comma-separated list of ISO 3166 alpha 2 country codes. |
| `types` | `string` | Limit results to one or more types of features, provided as a comma-separated list. Pass one or more of the type names as a comma separated list. If no types are specified, all possible types may be returned. Available types are: `country`, `region`, `postcode`, `district`, `place`, `city`, `locality`, `neighborhood`, `street`, `address`, `poi`, and `category`. See the [Administrative unit types section](#administrative-unit-types) for details about these types. |
| `poi_category` | `string` | Limit results to those that belong to one or more categories, provided as a comma-separated list. |
| `poi_category_exclusions` | `string` | A comma-separated list of canonical category names that limits POI results to those that are not part of the given categories. |
| `eta_type` | `string` | Enable Estimate Time Arrival (ETA) calculation in the response. The only allowed value for this parameter is `navigation`. When this parameters is used, `navigation_profile` and either `origin` or `proximity` is also should be provided. Enabling ETA calculations will introduce additional latency and incur extra costs, as each search result for which ETAs are calculated (matrix elements) will be billed according to the [Mapbox Matrix API](https://docs.mapbox.com/api/navigation/matrix/) pricing. |
| `navigation_profile` | `string` | When ETA calculation is enabled, the navigation routing profile to use. Available profiles are: `driving`, `walking`, and `cycling`. |
| `origin` | `string` | When ETA calculation is enabled, location from which to calculate distance. Provided as two comma-separated coordinates in `longitude,latitude` order. When both `proximity` and `origin` are provided, `origin` is interpreted as the target of a route, while `proximity` indicates the current user location. |

### Example request: Get autocomplete suggestions

```bash
# Search for Michigan Stadium with limit=1

$ curl "https://api.mapbox.com/search/searchbox/v1/suggest?q=Michigan%20Stadium&language=en&limit=1&session_token=[GENERATED-UUID]&proximity=-83.748708,42.265837&country=US&access_token=YOUR_MAPBOX_ACCESS_TOKEN"
```

### Response: Get autocomplete suggestions

The response to a request to the `/suggest` endpoint is an array of JSON suggestion objects. A suggestion will include a result name, address information, geographical context, and additional metadata when available (such as distance to proximity point). It does not include geographic coordinates. To get coordinates, make a call to the [`/retrieve` endpoint](#retrieve-a-suggested-feature) with the `mapbox_id` provided in the `/suggest` result.

Using the `limit` parameter, you can increase the maximum number of results up to 10. Pagination is not available, but this feature may be added in a later release. There is not an option to customize the order of search results.

Each result object contains the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `suggestions` | array of objects | The returned suggestion objects. See the table below for details on the properties contained in each suggestion object. |
| `attribution` | `string` | The attribution data for results. |

Each suggestion object contains the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | [required] The name of the feature. |
| `name_preferred` | `string` | [optional] The preferred name of the feature, if different than `name`. |
| `mapbox_id` | `string` | [required] The id to use with `/retrieve` to get full feature details. |
| `feature_type` | `string` | [required] The type of the result. For POIs, this will be `poi`. For categories, this will be `category`. For address-type results, the global context hierarchy is used (`country`, `region`, `postcode`, `district`, `place`, `locality`, `neighborhood`, `address`). See the [Administrative unit types section](#administrative-unit-types) for details about these types. |
| `address` | `string` | [optional] The address of the result containing the address number and street. |
| `full_address` | `string` | [optional] The full address of the result, which concatenates `address` and `place_formatted`. |
| `place_formatted` | `string` | [required] A formatted string of result context comprised of the place, region, country, and postcode. |
| `context` | `object` | [required] The context of the feature. This context has layers that follow the [Administrative unit types](#administrative-unit-types). |
| `context.country` | `object` | [optional] The country of the result. This layer includes properties `id`, `name`, `country_code` (the ISO_3166_1 alpha 2 code), and `country_code_alpha_3` (the ISO_3166_1 alpha 3 code). |
| `context.region` | `object` | [optional] The region of the result. This layer includes properties `id`, `name`, `region_code`, and `region_code_full` (the ISO_3166_2 code). |
| `context.postcode` | `object` | [optional] The postcode of the result. This layer includes properties `id` and `name`. |
| `context.district` | `object` | [optional] The district of the result. This layer includes properties `id` and `name`. |
| `context.place` | `object` | [optional] The place of the result. This layer includes properties `id` and `name`. |
| `context.locality` | `object` | [optional] The locality of the result. This layer includes properties `id` and `name`. |
| `context.neighborhood` | `object` | [optional] The neighborhood of the result. This layer includes properties `id` and `name`. |
| `context.address` | `object` | [optional] The address of the result including the address number and street. This layer includes properties `id`, `name`, `address_number`, `street_name`. |
| `context.street` | `object` | [optional] The street of the result. This layer includes properties `id` and `name`. |
| `language` | `string` | [required] An IETF language tag indicating the language of the result. |
| `maki` | `string` | [optional] A string representing an associated [Maki icon](https://docs.mapbox.com/help/glossary/maki/) to use for this result. |
| `poi_category` | `array` | [optional] An array including the POI categories the result falls into, if it is a POI. |
| `poi_category_ids` | `array` | [optional] An array including the canonical POI category IDs the result falls into, if it is a POI. |
| `brand` | `array` | [optional] An array containing associated commercial brand names for the result, if it is a POI and is applicable. |
| `brand_id` | `array` | [optional] An array containing canonical IDs of commercial brands for the result, if it is a POI and is applicable. |
| `external_ids` | `object` | [optional] An object containing the IDs of the feature found in external databases, with the keys being the data source names and the values being the IDs. |
| `metadata` | `object` | [optional] An object containing additional metadata for the feature, if applicable. |
| `distance` | `number` | [optional] An approximate distance to the `origin` location, in meters. If `origin` is not provided, it will show the approximate distance to the `proximity` location, in meters. |
| `eta` | `number` | [optional] The estimated time of arrival from the origin point to the feature, in minutes. If origin is not provided, then this will be the estimated time of arrival from the proximity point to the feature, in minutes. Only provided when `eta_type`, `navigation_profile` and `origin`/`proximity` are used in the request. If an address is not on the road network, an ETA will not be provided. |
| `added_distance` | `number` | [optional] The distance added to an input route by including the given suggestion, in meters. |
| `added_time` | `number` | [optional] The estimated time added to an input route by including the given suggestion, in minutes. |

### Example responses: Get autocomplete suggestions

```json
{
  "suggestions": [
    {
      "name": "Michigan Stadium",
      "mapbox_id": "Example ID",
      "feature_type": "poi",
      "address": "1201 S Main St",
      "full_address": "1201 S Main St, Ann Arbor, Michigan 48104, United States of America",
      "place_formatted": "Ann Arbor, Michigan 48104, United States of America",
      "context": {
        "country": {
          "name": "United States of America",
          "country_code": "US",
          "country_code_alpha_3": "USA"
        },
        "region": {
          "name": "Michigan",
          "region_code": "MI",
          "region_code_full": "US-MI"
        },
        "postcode": { "name": "48104" },
        "place": { "name": "Ann Arbor" },
        "neighborhood": { "name": "South Main" },
        "street": { "name": "s main st" }
      },
      "language": "en",
      "maki": "marker",
      "poi_category": ["track", "sports"],
      "poi_category_ids": ["track", "sports"],
      "external_ids": {
        "safegraph": "Example ID",
        "foursquare": "Example ID"
      },
      "metadata": {}
    }
  ],
  "attribution": "© 2023 Mapbox and its suppliers. All rights reserved. Use of this data is subject to the Mapbox Terms of Service. (https://www.mapbox.com/about/maps/)"
}
```

### Retrieve a suggested feature

The `/retrieve` endpoint provides detailed information about a feature including geographic coordinates. In a search session, this endpoint is called when the user selects an item from the suggested results provided by `/suggest` endpoint. For more details, see the [Retrieve a suggested feature](#retrieve-a-suggested-feature) section of this documentation.

**GET** : `https://api.mapbox.com/search/searchbox/v1/retrieve/{id}`

After a successful call to the `/suggest` endpoint, you will use the ID contained in a suggestion's `mapbox_id` property to retrieve detailed information about the feature.

<table><thead><tr><th>Required parameters</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td><code>session_token</code></td><td><code>string</code></td><td>A customer-provided session token value, which groups a series of requests together for <a href="#search-box-api-pricing">billing purposes</a>. <a href="https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)">UUIDv4</a> is recommended. For more information on how <code>session_token</code> is used to group Search API calls into one session, see the <a href="#session-billing">Session-based pricing</a> section of this documentation.<br><br>Each concurrent session must use a distinct <code>session_token</code> value. The value must match the <code>session_token</code> used in the preceding <code>/suggest</code> calls.</td></tr><tr><td><code>access_token</code></td><td><code>string</code></td><td>A valid Mapbox <a href="/guides/#access-tokens-and-token-scopes">access token</a>.</td></tr></tbody></table>

| Optional parameters | Type | Description |
| --- | --- | --- |
| `language` | `string` | The ISO language code to be returned. If not provided, the default is English. |
| `eta_type` | `string` | Enable Estimate Time Arrival (ETA) calculation in the response. The only allowed value for this parameter is `navigation`. When this parameters is used, `navigation_profile` and either `origin` or `proximity` is also should be provided. Enabling ETA calculations will introduce additional latency and incur extra costs, as each search result for which ETAs are calculated (matrix elements) will be billed according to the [Mapbox Matrix API](https://docs.mapbox.com/api/navigation/matrix/) pricing. |
| `navigation_profile` | `string` | When ETA calculation is enabled, the navigation routing profile to use. Available profiles are: `driving`, `walking`, and `cycling`. |
| `origin` | `string` | When ETA calculation is enabled, location from which to calculate distance. Provided as two comma-separated coordinates in `longitude,latitude` order. When both `proximity` and `origin` are provided, `origin` is interpreted as the target of a route, while `proximity` indicates the current user location. |

### Example request: Retrieve a suggested feature

```bash
# Retrieve a suggested feature

$ curl "https://api.mapbox.com/search/searchbox/v1/retrieve/{id}?session_token=[GENERATED-UUID]&access_token=YOUR_MAPBOX_ACCESS_TOKEN"
```

### Response: Retrieve a suggested feature

The `/retrieve` endpoint returns a GeoJSON `FeatureCollection`.

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string` | This will always be `"FeatureCollection"`. |
| `features` | array of objects | The returned feature objects. See the table below for details on the properties contained by each feature object. |
| `attribution` | `string` | The attribution data for results. |

Each feature in the response body contains the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string` | [required] This will always be `"Feature"`. |
| `geometry` | `object` | [required] An object describing the spatial geometry of the returned feature. |
| `geometry.coordinates` | `array` | [required] The coordinates of the feature, formatted as `[longitude,latitude]`. |
| `geometry.type` | `string` | [required] This will always be `"Point"`. |
| `properties` | `object` | [required] The specific properties associated with the returned feature. |
| `properties.name` | `string` | [required] The name of the feature. |
| `properties.name_preferred` | `string` | [optional] The preferred name of the feature, if different than `properties.name`. |
| `properties.mapbox_id` | `string` | [required] The ID associated with the feature. |
| `properties.feature_type` | `string` | [required] The type of the result. For POIs, this will be `poi`. For address-type results, the global context hierarchy is used (`country`, `region`, `postcode`, `district`, `place`, `locality`, `neighborhood`, `address`). See the [Administrative unit types section](#administrative-unit-types) for details about these types. |
| `properties.address` | `string` | [optional] The address of the result containing the address number and street. |
| `properties.full_address` | `string` | [optional] The full address of the result, which concatenates `properties.address` and `properties.place_formatted`. |
| `properties.place_formatted` | `string` | [optional] A formatted string of result context comprised of the place, region, country, and postcode. It is the part of the result which comes after `address`. |
| `properties.context` | `object` | [required] The context of the feature. |
| `properties.context.country` | `object` | [optional] The country of the result. This layer includes properties `id`, `name`, `country_code` (the ISO_3166_1 alpha 2 code), and `country_code_alpha_3` (the ISO_3166_1 alpha 3 code). |
| `properties.context.region` | `object` | [optional] The region of the result. This layer includes properties `id`, `name`, `region_code`, and `region_code_full` (the ISO_3166_2 code). |
| `properties.context.postcode` | `object` | [optional] The postcode of the result. This layer includes properties `id` and `name`. |
| `properties.context.district` | `object` | [optional] The district of the result. This layer includes properties `id` and `name`. |
| `properties.context.place` | `object` | [optional] The place of the result. This layer includes properties `id` and `name`. |
| `properties.context.locality` | `object` | [optional] The locality of the result. This layer includes properties `id` and `name`. |
| `properties.context.neighborhood` | `object` | [optional] The neighborhood of the result. This layer includes properties `id` and `name`. |
| `properties.context.address` | `object` | [optional] The address of the result including the address number and street. This layer includes properties `id`, `name`, `address_number`, and `street_name`. |
| `properties.context.street` | `object` | [optional] The street of the result. This layer includes properties `id` and `name`. |
| `properties.coordinates` | `object` | [required] The geographical coordinates of the result. |
| `properties.coordinates.longitude` | `number` | [required] The longitudinal coordinate of the result. |
| `properties.coordinates.latitude` | `number` | [required] The latitudinal coordinate of the result. |
| `properties.coordinates.accuracy` | `string` | [optional] The accuracy of the geographical coordinate of the result. This is only available for address-type results and the options are `rooftop`, `parcel`, `point`, `interpolated`, `intersection`, `approximate`, and `street`. |
| `properties.coordinates.routable_points` | `array` | [optional] An array of objects containing information about the feature's routable points. A routable point object contains properties `name`, `latitude`, and `longitude`, and an optional `note`. |
| `properties.bbox` | `array` | [optional] A bounding box in the format `minimum longitude`,`minimum latitude`,`maximum longitude`,`maximum latitude`. |
| `properties.language` | `string` | [optional] An IETF language tag indicating the language of the result. |
| `properties.maki` | `string` | [optional] A string representing an associated [Maki icon](https://docs.mapbox.com/help/glossary/maki/) to use for this result. |
| `properties.poi_category` | `array` | [optional] An array including the POI categories the result falls into, if it is a POI. |
| `properties.poi_category_ids` | `array` | [optional] An array including the canonical POI category IDs the result falls into, if it is a POI. |
| `properties.brand` | `array` | [optional] An array containing associated commercial brand names for the result, if it is a POI and is applicable. |
| `properties.brand_id` | `array` | [optional] An array containing canonical IDs of commercial brands for the result, if it is a POI and is applicable. |
| `properties.external_ids` | `object` | [optional] An object containing the IDs of the feature found in external databases, with the keys being the data source names and the values being the IDs. |
| `properties.metadata` | `object` | [optional] An object containing additional metadata for the feature, if applicable. |

### Example responses: Retrieve a suggested feature

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "coordinates": [-83.748708, 42.265837], "type": "Point" },
      "properties": {
        "name": "Michigan Stadium",
        "mapbox_id": "Example ID",
        "feature_type": "poi",
        "address": "1201 S Main St",
        "full_address": "1201 S Main St, Ann Arbor, Michigan 48104, United States of America",
        "place_formatted": "Ann Arbor, Michigan 48104, United States of America",
        "context": {
          "country": {
            "name": "United States of America",
            "country_code": "US",
            "country_code_alpha_3": "USA"
          },
          "region": {
            "name": "Michigan",
            "region_code": "MI",
            "region_code_full": "US-MI"
          },
          "postcode": { "name": "48104" },
          "place": { "name": "Ann Arbor" },
          "neighborhood": { "name": "South Main" },
          "street": { "name": "s main st" }
        },
        "coordinates": {
          "latitude": 42.265837,
          "longitude": -83.748708,
          "routable_points": [
            {
              "name": "default",
              "latitude": 42.265837,
              "longitude": -83.748708
            }
          ]
        },
        "maki": "marker",
        "poi_category": ["track", "sports"],
        "poi_category_ids": ["track", "sports"],
        "external_ids": {
          "safegraph": "Example ID",
          "foursquare": "Example ID"
        },
        "metadata": {}
      }
    }
  ],
  "attribution": "© 2023 Mapbox and its suppliers. All rights reserved. Use of this data is subject to the Mapbox Terms of Service. (https://www.mapbox.com/about/maps/)"
}
```

## Text Search

Search Box API enables developers to send one-off search requests and get relevant results. Developers can create search requests with the `/forward` endpoint and get a list of search results with coordinates and metadata. In contrast to Interactive Search, the `/forward` endpoint will not provide type-ahead suggestions, e.g., brand and category suggestions, but will only provide relevant search results.

### Get search results

**GET** : `https://api.mapbox.com/search/searchbox/v1/forward?q={search_text}`

| Required parameters | Type | Description |
| --- | --- | --- |
| `q` | `string` | The user's query string. The query string is limited to 256 characters. |
| `access_token` | `string` | A valid Mapbox [access token](https://docs.mapbox.com/api/guides/#access-tokens-and-token-scopes). |

You can further refine the results of a query to this endpoint with the following optional parameters:

| Optional parameters | Type | Description |
| --- | --- | --- |
| `language` | `string` | The ISO language code to be returned. If not provided, the default is English. |
| `limit` | `integer` | The number of results to return, up to 10. |
| `proximity` | `string` | Bias the response to favor results that are closer to a specific location. Provide either `ip` to get results closest to the user's IP location or provide two comma-separated coordinates in `longitude,latitude` order. If not provided, the default is IP proximity. When both `proximity` and `origin` are provided, `origin` is interpreted as the target of a route, while `proximity` indicates the current user location. |
| `bbox` | `string` | Limit results to only those contained within the supplied bounding box. Bounding boxes should be supplied as four numbers separated by commas, in `minimum longitude`,`minimum latitude`,`maximum longitude`,`maximum latitude` order. The bounding box cannot cross the 180th meridian. |
| `country` | `string` | A comma-separated list of ISO 3166 alpha 2 country codes. |
| `types` | `string` | Limit results to one or more types of features, provided as a comma-separated list. Pass one or more of the type names as a comma separated list. If no types are specified, all possible types may be returned. Available types are: `country`, `region`, `postcode`, `district`, `place`, `city`, `locality`, `neighborhood`, `street`, `address`, `poi`, and `category`. See the [Administrative unit types section](#administrative-unit-types) for details about these types. |
| `poi_category` | `string` | Limit results to those that belong to one or more categories, provided as a comma-separated list. |
| `poi_category_exclusions` | `string` | A comma-separated list of canonical category names that limits POI results to those that are not part of the given categories. |
| `auto_complete` | `string` | Enable Autocomplete Mode by setting the value to `true`. When Autocomplete Mode is enabled, the search results will include partial and fuzzy matches. This behavior enhances search functionality by suggesting potential matches as the user types, making it suitable for autocomplete implementations. |
| `eta_type` | `string` | Enable Estimate Time Arrival (ETA) calculation in the response. The only allowed value for this parameter is `navigation`. When this parameters is used, `navigation_profile` and either `origin` or `proximity` is also should be provided. Enabling ETA calculations will introduce additional latency and incur extra costs, as each search result for which ETAs are calculated (matrix elements) will be billed according to the [Mapbox Matrix API](https://docs.mapbox.com/api/navigation/matrix/) pricing. |
| `navigation_profile` | `string` | When ETA calculation is enabled, the navigation routing profile to use. Available profiles are: `driving`, `walking`, and `cycling`. |
| `origin` | `string` | When ETA calculation is enabled, location from which to calculate distance. Provided as two comma-separated coordinates in `longitude,latitude` order. When both `proximity` and `origin` are provided, `origin` is interpreted as the target of a route, while `proximity` indicates the current user location. |

### Example requests: Search request

```bash

$ curl "https://api.mapbox.com/search/searchbox/v1/forward?q=34170%20Gannon%20Terrace&language=en&limit=1&proximity=-121.90662,37.42827&country=US&access_token=YOUR_MAPBOX_ACCESS_TOKEN"

```

```bash
$ curl "https://api.mapbox.com/search/searchbox/v1/forward?q=新橋一丁十番一号,東京都港区新橋1丁目10番1号&language=ja&limit=1&proximity=13.38333,52.51667&country=JP&access_token=YOUR_MAPBOX_ACCESS_TOKEN"
```

### Response: Search request

The response to a request to the `/forward` endpoint is a GeoJSON `FeatureCollection`.

Using the `limit` parameter, you can increase the maximum number of results up to 10. Pagination is not available, but this feature may be added in a later release. There is not an option to customize the order of search results.

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string` | This will always be `"FeatureCollection"`. |
| `features` | array of objects | The returned feature objects. See the table below for details on the properties contained by each feature object. |
| `attribution` | `string` | The attribution data for results. |

Each feature in the response body contains the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string` | [required] This will always be `"Feature"`. |
| `geometry` | `object` | [required] An object describing the spatial geometry of the returned feature. |
| `geometry.coordinates` | `array` | [required] The coordinates of the feature, formatted as `[longitude,latitude]`. |
| `geometry.type` | `string` | [required] This will always be `"Point"`. |
| `properties` | `object` | [required] The specific properties associated with the returned feature. |
| `properties.name` | `string` | [required] The name of the feature. |
| `properties.name_preferred` | `string` | [optional] The preferred name of the feature, if different than `properties.name`. |
| `properties.mapbox_id` | `string` | [required] The ID associated with the feature. |
| `properties.feature_type` | `string` | [required] The type of the result. For POIs, this will be `poi`. For address-type results, the global context hierarchy is used (`country`, `region`, `postcode`, `district`, `place`, `locality`, `neighborhood`, `address`). See the [Administrative unit types section](#administrative-unit-types) for details about these types. |
| `properties.address` | `string` | [optional] The address of the result containing the address number and street. |
| `properties.full_address` | `string` | [optional] The full address of the result, which concatenates `properties.address` and `properties.place_formatted`. |
| `properties.place_formatted` | `string` | [optional] A formatted string of result context comprised of the place, region, country, and postcode. It is the part of the result which comes after `address`. |
| `properties.context` | `object` | [required] The context of the feature. |
| `properties.context.country` | `object` | [optional] The country of the result. This layer includes properties `id`, `name`, `country_code` (the ISO_3166_1 alpha 2 code), and `country_code_alpha_3` (the ISO_3166_1 alpha 3 code). |
| `properties.context.region` | `object` | [optional] The region of the result. This layer includes properties `id`, `name`, `region_code`, and `region_code_full` (the ISO_3166_2 code). |
| `properties.context.postcode` | `object` | [optional] The postcode of the result. This layer includes properties `id` and `name`. |
| `properties.context.district` | `object` | [optional] The district of the result. This layer includes properties `id` and `name`. |
| `properties.context.place` | `object` | [optional] The place of the result. This layer includes properties `id` and `name`. |
| `properties.context.locality` | `object` | [optional] The locality of the result. This layer includes properties `id` and `name`. |
| `properties.context.neighborhood` | `object` | [optional] The neighborhood of the result. This layer includes properties `id` and `name`. |
| `properties.context.address` | `object` | [optional] The address of the result including the address number and street. This layer includes properties `id`, `name`, `address_number`, and `street_name`. |
| `properties.context.street` | `object` | [optional] The street of the result. This layer includes properties `id` and `name`. |
| `properties.coordinates` | `object` | [required] The geographical coordinates of the result. |
| `properties.coordinates.longitude` | `number` | [required] The longitudinal coordinate of the result. |
| `properties.coordinates.latitude` | `number` | [required] The latitudinal coordinate of the result. |
| `properties.coordinates.accuracy` | `string` | [optional] The accuracy of the geographical coordinate of the result. This is only available for address-type results and the options are `rooftop`, `parcel`, `point`, `interpolated`, `intersection`, `approximate`, and `street`. |
| `properties.coordinates.routable_points` | `array` | [optional] An array of objects containing information about the feature's routable points. A routable point object contains properties `name`, `latitude`, and `longitude`, and an optional `note`. |
| `properties.bbox` | `array` | [optional] A bounding box in the format `minimum longitude`,`minimum latitude`,`maximum longitude`,`maximum latitude`. |
| `properties.language` | `string` | [optional] An IETF language tag indicating the language of the result. |
| `properties.maki` | `string` | [optional] A string representing an associated [Maki icon](https://docs.mapbox.com/help/glossary/maki/) to use for this result. |
| `properties.poi_category` | `array` | [optional] An array including the POI categories the result falls into, if it is a POI. |
| `properties.poi_category_ids` | `array` | [optional] An array including the canonical POI category IDs the result falls into, if it is a POI. |
| `properties.brand` | `array` | [optional] An array containing associated commercial brand names for the result, if it is a POI and is applicable. |
| `properties.brand_id` | `array` | [optional] An array containing canonical IDs of commercial brands for the result, if it is a POI and is applicable. |
| `properties.external_ids` | `object` | [optional] An object containing the IDs of the feature found in external databases, with the keys being the data source names and the values being the IDs. |
| `properties.metadata` | `object` | [optional] An object containing additional metadata for the feature, if applicable. |

### Example responses: Search request

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "coordinates": [-122.059632, 37.561526],
        "type": "Point"
      },
      "properties": {
        "name": "34170 Gannon Terrace",
        "mapbox_id": "dXJuOm1ieGFkcjpiNjg2YTY2MS0xZTU4LTRiYmEtYTJhNC1mODdkNTRhNjczZWI",
        "feature_type": "address",
        "address": "34170 Gannon Terrace",
        "full_address": "34170 Gannon Terrace, Fremont, California 94555, United States",
        "place_formatted": "Fremont, California 94555, United States",
        "context": {
          "country": {
            "id": "dXJuOm1ieHBsYzpJdXc",
            "name": "United States",
            "country_code": "US",
            "country_code_alpha_3": "USA"
          },
          "region": {
            "id": "dXJuOm1ieHBsYzpCbVRz",
            "name": "California",
            "region_code": "CA",
            "region_code_full": "US-CA"
          },
          "postcode": {
            "id": "dXJuOm1ieHBsYzpFclN1N0E",
            "name": "94555"
          },
          "district": {
            "id": "dXJuOm1ieHBsYzpBMGJz",
            "name": "Alameda County"
          },
          "place": {
            "id": "dXJuOm1ieHBsYzpCdzdvN0E",
            "name": "Fremont"
          },
          "neighborhood": {
            "id": "dXJuOm1ieHBsYzo2dXpz",
            "name": "Ardenwood"
          },
          "address": {
            "id": "dXJuOm1ieGFkcjpiNjg2YTY2MS0xZTU4LTRiYmEtYTJhNC1mODdkNTRhNjczZWI",
            "name": "34170 Gannon Terrace",
            "address_number": "34170",
            "street_name": "gannon terrace"
          },
          "street": {
            "id": "dXJuOm1ieGFkcjpiNjg2YTY2MS0xZTU4LTRiYmEtYTJhNC1mODdkNTRhNjczZWI",
            "name": "gannon terrace"
          }
        },
        "coordinates": {
          "latitude": 37.561526,
          "longitude": -122.059632,
          "accuracy": "rooftop",
          "routable_points": [
            {
              "name": "default",
              "latitude": 37.561366,
              "longitude": -122.05968
            }
          ]
        },
        "language": "en",
        "maki": "marker",
        "external_ids": {},
        "metadata": {}
      }
    }
  ],
  "attribution": "© 2023 Mapbox and its suppliers. All rights reserved. Use of this data is subject to the Mapbox Terms of Service. (https://www.mapbox.com/about/maps/)"
}
```

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "coordinates": [139.7596694, 35.6674972],
        "type": "Point"
      },
      "properties": {
        "name": "〒105-0004 東京都港区新橋1丁目10番1号",
        "feature_type": "address",
        "address": "〒105-0004 東京都港区新橋1丁目10番1号",
        "full_address": "〒105-0004 東京都港区新橋1丁目10番1号, 〒105-0004 東京都港区新橋1丁目10番1号",
        "place_formatted": "〒105-0004 東京都港区新橋1丁目10番1号",
        "context": {
          "postcode": {
            "name": "105-0004"
          },
          "block": {
            "name": "10"
          },
          "address": {
            "id": "address",
            "name": "〒105-0004 東京都港区新橋1丁目10番1号",
            "address_number": "10番1号",
            "street_name": "新橋1丁目"
          },
          "street": {
            "name": "新橋1丁目"
          }
        },
        "coordinates": {
          "latitude": 35.6674972,
          "longitude": 139.7596694,
          "accuracy": "rooftop"
        },
        "language": "ja",
        "maki": "marker",
        "external_ids": {},
        "metadata": {
          "reading": {
            "ja_kana": "トウキョウトミナトクシンバシ",
            "ja_latin": "toukyouto minatoku shinbashi"
          }
        }
      }
    }
  ],
  "attribution": "© 2023 Mapbox and its suppliers. All rights reserved. Use of this data is subject to the Mapbox Terms of Service. (https://www.mapbox.com/about/maps/)"
}
```

## Category Search

Category Search makes it possible to browse entire categories of results, like coffee shops, hotels, and bookstores around a specific location or along a route.

The `/category` endpoint provides a list of POIs for a given location. In a search use case, this endpoint is used to create hot-buttons to execute search for a specific category, for example a coffee button that surfaces all nearby coffee shops.

### Retrieve POIs by category

**GET** : `https://api.mapbox.com/search/searchbox/v1/category/{canonical_category_id}`

Use the Category Search endpoint if you want to query points of interest (POIs) results filtered by a category at a specific location or along a route. The endpoint will only return POIs with the specified category.

Examples how you can use the `/category` endpoint:

-   Find food around you (`food_and_drink`)
-   Find an Indian restaurant (`indian_restaurant`)
-   Find a gas station along a route (`gas_station`)

| Required parameters | Type | Description |
| --- | --- | --- |
| `access_token` | `string` | A valid Mapbox [access token](https://docs.mapbox.com/api/guides/#access-tokens-and-token-scopes). |

You can further refine the results of a query to this endpoint with the following optional parameters:

| Optional parameters | Type | Description |
| --- | --- | --- |
| `language` | `string` | The ISO language code to be returned. If not provided, the default is English. |
| `limit` | `integer` | The number of results to return, up to 25. |
| `proximity` | `string` | Bias the response to favor results that are closer to a specific location. Provide either `ip` to get results closest to the user's IP location or provide two comma-separated coordinates in `longitude,latitude` order. If not provided, the default is IP proximity. When both `proximity` and `origin` are provided, `origin` is interpreted as the target of a route, while `proximity` indicates the current user location. |
| `bbox` | `string` | Limit results to only those contained within the supplied bounding box. Bounding boxes should be supplied as four numbers separated by commas, in `minimum longitude`,`minimum latitude`,`maximum longitude`,`maximum latitude` order. The bounding box cannot cross the 180th meridian. |
| `country` | `string` | A comma-separated list of ISO 3166 alpha 2 country codes. |
| `types` | `string` | Limit results to one or more types of features, provided as a comma-separated list. Pass one or more of the type names as a comma separated list. If no types are specified, all possible types may be returned. Available types are: `country`, `region`, `postcode`, `district`, `place`, `city`, `locality`, `neighborhood`, `street`, `address`, `poi`, and `category`. See the [Administrative unit types section](#administrative-unit-types) for details about these types. |
| `poi_category_exclusions` | `string` | A comma-separated list of canonical category names that limits POI results to those that are not part of the given categories. |
| `sar_type` | `string` | Enable search-along-route (`SAR`) requests that shows the search results around the path provided with `route` parameter. The only allowed value for this parameter is `isochrone`. |
| `route` | `string` | When `SAR` is enabled, a polyline encoded linestring describing the route to be used for searching. Both polyline5 and polyline6 precision are accepted, but must be specified using the `route_geometry` parameter. Note that for /forward queries searching along a route, only brand and category searches are supported. |
| `route_geometry` | `string` | When `SAR` is enabled, passed in conjunction with a route polyline describing its precision. Options are `polyline` or `polyline6`. If this parameter is not provided with a `route`, the default is `polyline`. Correct results depend on including the right `route_geometry` for the `route` provided. |
| `time_deviation` | `number` | When `SAR` is enabled, maximum detour allowed in estimated minutes from the route. |

### Example request: Search for POIs by Category

```bash
# Search for POIs in the `coffee` category

$ curl -X GET "https://api.mapbox.com/search/searchbox/v1/category/coffee?access_token=YOUR_MAPBOX_ACCESS_TOKEN&language=en&limit=5&proximity=-122.41%2C39&bbox=-124.35526789303981%2C38.41262975705166%2C-120.52250410696067%2C39.54169087094499
```

### Response: Search for POIs by category

The `/category` endpoints returns a GeoJSON `FeatureCollection`

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string` | This will always be `"FeatureCollection"`. |
| `features` | array of objects | The returned feature objects. See the table below for details on the properties contained by each feature object. |
| `attribution` | `string` | The attribution data for results. |

Each feature in the response body contains the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string` | [required] This will always be `"Feature"`. |
| `geometry` | `object` | [required] An object describing the spatial geometry of the returned feature. |
| `geometry.coordinates` | `array` | [required] The coordinates of the feature, formatted as `[longitude,latitude]`. |
| `geometry.type` | `string` | [required] This will always be `"Point"`. |
| `properties` | `object` | [required] The specific properties associated with the returned feature. |
| `properties.name` | `string` | [required] The name of the feature. |
| `properties.name_preferred` | `string` | [optional] The preferred name of the feature, if different than `properties.name`. |
| `properties.mapbox_id` | `string` | [required] The ID associated with the feature. |
| `properties.feature_type` | `string` | [required] The type of the result. For POIs, this will be `poi`. For address-type results, the global context hierarchy is used (`country`, `region`, `postcode`, `district`, `place`, `locality`, `neighborhood`, `address`). See the [Administrative unit types section](#administrative-unit-types) for details about these types. |
| `properties.address` | `string` | [optional] The address of the result containing the address number and street. |
| `properties.full_address` | `string` | [optional] The full address of the result, which concatenates `properties.address` and `properties.place_formatted`. |
| `properties.place_formatted` | `string` | [optional] A formatted string of result context comprised of the place, region, country, and postcode. It is the part of the result which comes after `address`. |
| `properties.context` | `object` | [required] The context of the feature. |
| `properties.context.country` | `object` | [optional] The country of the result. This layer includes properties `id`, `name`, `country_code` (the ISO_3166_1 alpha 2 code), and `country_code_alpha_3` (the ISO_3166_1 alpha 3 code). |
| `properties.context.region` | `object` | [optional] The region of the result. This layer includes properties `id`, `name`, `region_code`, and `region_code_full` (the ISO_3166_2 code). |
| `properties.context.postcode` | `object` | [optional] The postcode of the result. This layer includes properties `id` and `name`. |
| `properties.context.district` | `object` | [optional] The district of the result. This layer includes properties `id` and `name`. |
| `properties.context.place` | `object` | [optional] The place of the result. This layer includes properties `id` and `name`. |
| `properties.context.locality` | `object` | [optional] The locality of the result. This layer includes properties `id` and `name`. |
| `properties.context.neighborhood` | `object` | [optional] The neighborhood of the result. This layer includes properties `id` and `name`. |
| `properties.context.address` | `object` | [optional] The address of the result including the address number and street. This layer includes properties `id`, `name`, `address_number`, and `street_name`. |
| `properties.context.street` | `object` | [optional] The street of the result. This layer includes properties `id` and `name`. |
| `properties.coordinates` | `object` | [required] The geographical coordinates of the result. |
| `properties.coordinates.longitude` | `number` | [required] The longitudinal coordinate of the result. |
| `properties.coordinates.latitude` | `number` | [required] The latitudinal coordinate of the result. |
| `properties.coordinates.accuracy` | `string` | [optional] The accuracy of the geographical coordinate of the result. This is only available for address-type results and the options are `rooftop`, `parcel`, `point`, `interpolated`, `intersection`, `approximate`, and `street`. |
| `properties.coordinates.routable_points` | `array` | [optional] An array of objects containing information about the feature's routable points. A routable point object contains properties `name`, `latitude`, and `longitude`, and an optional `note`. |
| `properties.bbox` | `array` | [optional] A bounding box in the format `minimum longitude`,`minimum latitude`,`maximum longitude`,`maximum latitude`. |
| `properties.language` | `string` | [optional] An IETF language tag indicating the language of the result. |
| `properties.maki` | `string` | [optional] A string representing an associated [Maki icon](https://docs.mapbox.com/help/glossary/maki/) to use for this result. |
| `properties.poi_category` | `array` | [optional] An array including the POI categories the result falls into, if it is a POI. |
| `properties.poi_category_ids` | `array` | [optional] An array including the canonical POI category IDs the result falls into, if it is a POI. |
| `properties.brand` | `array` | [optional] An array containing associated commercial brand names for the result, if it is a POI and is applicable. |
| `properties.brand_id` | `array` | [optional] An array containing canonical IDs of commercial brands for the result, if it is a POI and is applicable. |
| `properties.external_ids` | `object` | [optional] An object containing the IDs of the feature found in external databases, with the keys being the data source names and the values being the IDs. |
| `properties.metadata` | `object` | [optional] An object containing additional metadata for the feature, if applicable. |

### Example response: Search for POIs by category

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "coordinates": [-122.582748, 39.029528], "type": "Point" },
      "properties": {
        "name": "Stonehouse Cellars",
        "mapbox_id": "CkIKQDRlNTdiODcxY2QyZjI0OGMwODNjZjE2Yzc1NTIyZDEyMjAyYzkzMmYzYTIwN2YwOTQ4ZDYxYjk1MTU5MmQ4ZjY=",
        "feature_type": "poi",
        "address": "500 Old Long Valley Rd",
        "full_address": "500 Old Long Valley Rd, Clearlake Oaks, California 95423, United States of America",
        "place_formatted": "Clearlake Oaks, California 95423, United States of America",
        "context": {
          "country": {
            "name": "United States of America",
            "country_code": "US",
            "country_code_alpha_3": "USA"
          },
          "region": {
            "name": "California",
            "region_code": "CA",
            "region_code_full": "US-CA"
          },
          "postcode": { "name": "95423" },
          "place": { "name": "Clearlake Oaks" },
          "street": { "name": "old long valley rd" }
        },
        "coordinates": {
          "latitude": 39.029528,
          "longitude": -122.582748,
          "routable_points": [
            {
              "name": "default",
              "latitude": 39.029528,
              "longitude": -122.582748
            }
          ]
        },
        "maki": "restaurant",
        "poi_category": [
          "restaurant",
          "food",
          "food and drink",
          "winery",
          "bar",
          "nightlife"
        ],
        "poi_category_ids": [
          "restaurant",
          "food",
          "food_and_drink",
          "winery",
          "bar",
          "nightlife"
        ],
        "external_ids": { "foursquare": "55208bfe498e78a725b4030d" },
        "metadata": { "primary_photo": [] }
      }
    }
  ],
  "attribution": "© 2023 Mapbox and its suppliers. All rights reserved. Use of this data is subject to the Mapbox Terms of Service. (https://www.mapbox.com/about/maps/)"
}
```

## List categories

The request to the `/list/category` endpoint will return a list of all the available categories with their canonical ID and name in the `language` you specified. This endpoint does not describe parent/child relationships and cannot be used to infer relationships between categories.

### Get category list

**GET** : `https://api.mapbox.com/search/searchbox/v1/list/category`

| Required parameters | Type | Description |
| --- | --- | --- |
| `access_token` | `string` | A valid Mapbox [access token](https://docs.mapbox.com/api/guides/#access-tokens-and-token-scopes). |

| Optional parameters | Type | Description |
| --- | --- | --- |
| `language` | `string` | The ISO language code to be returned. If not provided, English (en) will be used as the default. |

### Example Request: Get category list

```bash

# Get category list

$ curl -X GET "https://api.mapbox.com/search/searchbox/v1/list/category?access_token=YOUR_MAPBOX_ACCESS_TOKEN&language=en"
```

### Response: Get category list

The response will be a collection of category list items.

| Property | Type | Description |
| --- | --- | --- |
| `listItems` | array of objects | An array of category objects |
| `attribution` | `string` | The attribution data for results. |
| `version` | `string` | The service version information. Include this information if you report an issue to Mapbox. |

Each item in `listItems` has the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `canonical_id` | `string` | [required] The canonical category ID to use in a category "Hot Button" search |
| `icon` | `string` | [required] The Maki icon to use with the category |
| `name` | `string` | [required] The category name in the requested language |

### Example response: Get category list

```json
{
  "listItems": [
    {
      "canonical_id": "services",
      "icon": "marker",
      "name": "Services",
      "version": "25:6bd9b589a98b57a214d92076ecf35061eed6a629",
      "uuid": "71fed985-aa4b-4e50-83f1-97e5a0a0751e"
    },
    {
      "canonical_id": "shopping",
      "icon": "marker",
      "name": "Shopping",
      "version": "25:6bd9b589a98b57a214d92076ecf35061eed6a629",
      "uuid": "9d383df0-2f35-4932-9368-8cf0f488e701"
    },
    {
      "canonical_id": "food_and_drink",
      "icon": "marker",
      "name": "Food and Drink",
      "version": "25:6bd9b589a98b57a214d92076ecf35061eed6a629",
      "uuid": "20dbf11b-a90d-4571-8996-a1ccbfbd8680"
    },
    {
      "canonical_id": "food",
      "icon": "restaurant",
      "name": "Food",
      "version": "25:6bd9b589a98b57a214d92076ecf35061eed6a629",
      "uuid": "af0d6328-1e96-43d7-8925-decb4ed04a06"
    },
    {
      "canonical_id": "restaurant",
      "icon": "restaurant",
      "name": "Restaurant",
      "version": "25:6bd9b589a98b57a214d92076ecf35061eed6a629",
      "uuid": "1a9e12e7-2e8d-47ee-9c3d-1aaa7ced55b6"
    },
    {
      "canonical_id": "health_services",
      "icon": "marker",
      "name": "Health Services",
      "version": "25:6bd9b589a98b57a214d92076ecf35061eed6a629",
      "uuid": "f111ad81-9b4f-4346-b1dd-d7190a202276"
    },
    {
      "canonical_id": "office",
      "icon": "marker",
      "name": "Office",
      "version": "25:6bd9b589a98b57a214d92076ecf35061eed6a629",
      "uuid": "8388a638-fdae-42f0-b3e7-ee1c1f786601"
    },
    {
      "canonical_id": "education",
      "icon": "marker",
      "name": "Education",
      "version": "25:6bd9b589a98b57a214d92076ecf35061eed6a629",
      "uuid": "c530d2d8-ee87-4481-9289-088b97b796fa"
    },
    {
      "canonical_id": "nightlife",
      "icon": "marker",
      "name": "Nightlife",
      "version": "25:6bd9b589a98b57a214d92076ecf35061eed6a629",
      "uuid": "ecd6c887-9952-45a1-848d-ee50177cb61d"
    },
    {
      "canonical_id": "lodging",
      "icon": "lodging",
      "name": "Lodging",
      "version": "25:6bd9b589a98b57a214d92076ecf35061eed6a629",
      "uuid": "8de7b125-ac68-488f-b122-5c8b2706ff15"
    }
  ],
  "attribution": "© 2021 Mapbox and its suppliers. All rights reserved. Use of this data is subject to the Mapbox Terms of Service. (https://www.mapbox.com/about/maps/)",
  "version": "25:6bd9b589a98b57a214d92076ecf35061eed6a629"
}
```

## Reverse lookup

With Reverse lookup, you can get a list of addresses and POIs around a given coordinate (e,g, what is around 33.9416° N, 118.4085° W).

The `/reverse` endpoint allows you to look up a single pair of coordinates and returns the geographic feature or features that exist at that location.

### Do a reverse lookup

**GET** : `https://api.mapbox.com/search/searchbox/v1/reverse?longitude={longitude}&latitude={latitude}`

| Required parameters | Type | Description |
| --- | --- | --- |
| `longitude` | `number` | The longitudinal coordinate of coordinate for the reverse query. |
| `latitude` | `number` | The latitudinal coordinate of coordinate for the reverse query. |
| `access_token` | `string` | A valid Mapbox [access token](https://docs.mapbox.com/api/guides/#access-tokens-and-token-scopes). |

You can further refine the results of a query to this endpoint with the following optional parameters:

| Optional parameters | Type | Description |
| --- | --- | --- |
| `language` | `string` | The ISO language code to be returned. If not provided, the default is English. |
| `limit` | `integer` | The number of results to return, up to 10. |
| `country` | `string` | A comma-separated list of ISO 3166 alpha 2 country codes. |
| `types` | `string` | Limit results to one or more types of features, provided as a comma-separated list. Pass one or more of the type names as a comma separated list. If no types are specified, all possible types may be returned. Available types are: `country`, `region`, `prefecture`, `postcode`, `district`, `place`, `city`, `locality`, `oaza`, `block`, `street`, and `address`. See the [Administrative unit types section](#administrative-unit-types) for details about these types. |

### Example request: do a reverse lookup

```bash
$ curl "https://api.mapbox.com/search/searchbox/v1/reverse?longitude=-118.471383&latitude=34.023653&language=de&access_token=YOUR_MAPBOX_ACCESS_TOKEN"
```

### Response: do a reverse lookup

The response to a request to the `/reverse` endpoint is a GeoJSON `FeatureCollection`.

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string` | This will always be `"FeatureCollection"`. |
| `features` | array of objects | The returned feature objects. See the table below for details on the properties contained by each feature object. |
| `attribution` | `string` | The attribution data for results. |

Each feature in the response body contains the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string` | [required] This will always be `"Feature"`. |
| `geometry` | `object` | [required] An object describing the spatial geometry of the returned feature. |
| `geometry.coordinates` | `array` | [required] The coordinates of the feature, formatted as `[longitude,latitude]`. |
| `geometry.type` | `string` | [required] This will always be `"Point"`. |
| `properties` | `object` | [required] The specific properties associated with the returned feature. |
| `properties.name` | `string` | [required] The name of the feature. |
| `properties.name_preferred` | `string` | [optional] The preferred name of the feature, if different than `properties.name`. |
| `properties.mapbox_id` | `string` | [required] The ID associated with the feature. |
| `properties.feature_type` | `string` | [required] The type of the result. For POIs, this will be `poi`. For address-type results, the global context hierarchy is used (`country`, `region`, `postcode`, `district`, `place`, `locality`, `neighborhood`, `address`). See the [Administrative unit types section](#administrative-unit-types) for details about these types. |
| `properties.address` | `string` | [optional] The address of the result containing the address number and street. |
| `properties.full_address` | `string` | [optional] The full address of the result, which concatenates `properties.address` and `properties.place_formatted`. |
| `properties.place_formatted` | `string` | [optional] A formatted string of result context comprised of the place, region, country, and postcode. It is the part of the result which comes after `address`. |
| `properties.context` | `object` | [required] The context of the feature. |
| `properties.context.country` | `object` | [optional] The country of the result. This layer includes properties `id`, `name`, `country_code` (the ISO_3166_1 alpha 2 code), and `country_code_alpha_3` (the ISO_3166_1 alpha 3 code). |
| `properties.context.region` | `object` | [optional] The region of the result. This layer includes properties `id`, `name`, `region_code`, and `region_code_full` (the ISO_3166_2 code). |
| `properties.context.postcode` | `object` | [optional] The postcode of the result. This layer includes properties `id` and `name`. |
| `properties.context.district` | `object` | [optional] The district of the result. This layer includes properties `id` and `name`. |
| `properties.context.place` | `object` | [optional] The place of the result. This layer includes properties `id` and `name`. |
| `properties.context.locality` | `object` | [optional] The locality of the result. This layer includes properties `id` and `name`. |
| `properties.context.neighborhood` | `object` | [optional] The neighborhood of the result. This layer includes properties `id` and `name`. |
| `properties.context.address` | `object` | [optional] The address of the result including the address number and street. This layer includes properties `id`, `name`, `address_number`, and `street_name`. |
| `properties.context.street` | `object` | [optional] The street of the result. This layer includes properties `id` and `name`. |
| `properties.coordinates` | `object` | [required] The geographical coordinates of the result. |
| `properties.coordinates.longitude` | `number` | [required] The longitudinal coordinate of the result. |
| `properties.coordinates.latitude` | `number` | [required] The latitudinal coordinate of the result. |
| `properties.coordinates.accuracy` | `string` | [optional] The accuracy of the geographical coordinate of the result. This is only available for address-type results and the options are `rooftop`, `parcel`, `point`, `interpolated`, `intersection`, `approximate`, and `street`. |
| `properties.coordinates.routable_points` | `array` | [optional] An array of objects containing information about the feature's routable points. A routable point object contains properties `name`, `latitude`, and `longitude`, and an optional `note`. |
| `properties.bbox` | `array` | [optional] A bounding box in the format `minimum longitude`,`minimum latitude`,`maximum longitude`,`maximum latitude`. |
| `properties.language` | `string` | [optional] An IETF language tag indicating the language of the result. |
| `properties.maki` | `string` | [optional] A string representing an associated [Maki icon](https://docs.mapbox.com/help/glossary/maki/) to use for this result. |
| `properties.poi_category` | `array` | [optional] An array including the POI categories the result falls into, if it is a POI. |
| `properties.poi_category_ids` | `array` | [optional] An array including the canonical POI category IDs the result falls into, if it is a POI. |
| `properties.brand` | `array` | [optional] An array containing associated commercial brand names for the result, if it is a POI and is applicable. |
| `properties.brand_id` | `array` | [optional] An array containing canonical IDs of commercial brands for the result, if it is a POI and is applicable. |
| `properties.external_ids` | `object` | [optional] An object containing the IDs of the feature found in external databases, with the keys being the data source names and the values being the IDs. |
| `properties.metadata` | `object` | [optional] An object containing additional metadata for the feature, if applicable. |

### Example response: do a reverse lookup

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "coordinates": [13.3295589, 52.5125463], "type": "Point" },
      "properties": {
        "name": "Straße Des 17. Juni 115",
        "mapbox_id": "dXJuOm1ieGFkcjo2YjU1MDMxMy1iNzM0LTQxNjYtYjk0MC0zZTU1MTE4MmQwOGY",
        "feature_type": "address",
        "address": "Straße Des 17. Juni 115",
        "full_address": "Straße Des 17. Juni 115, 10623 Berlin, Germany",
        "place_formatted": "10623 Berlin, Germany",
        "context": {
          "country": {
            "id": "dXJuOm1ieHBsYzpJam8",
            "name": "Germany",
            "country_code": "DE",
            "country_code_alpha_3": "DEU"
          },
          "postcode": { "id": "dXJuOm1ieHBsYzpVYTQ2", "name": "10623" },
          "place": { "id": "dXJuOm1ieHBsYzpBY1E2", "name": "Berlin" },
          "locality": {
            "id": "dXJuOm1ieHBsYzpBd1pxT2c",
            "name": "Charlottenburg"
          },
          "address": {
            "id": "dXJuOm1ieGFkcjo2YjU1MDMxMy1iNzM0LTQxNjYtYjk0MC0zZTU1MTE4MmQwOGY",
            "name": "Straße Des 17. Juni 115",
            "address_number": "Straße",
            "street_name": "Des 17. Juni 115"
          },
          "street": { "name": "Des 17. Juni 115" }
        },
        "coordinates": {
          "latitude": 52.5125463,
          "longitude": 13.3295589,
          "accuracy": "rooftop",
          "routable_points": [
            {
              "name": "default",
              "latitude": 52.51264818693428,
              "longitude": 13.32955240836938
            }
          ]
        },
        "language": "en",
        "maki": "marker",
        "external_ids": {},
        "metadata": {}
      }
    }
  ],
  "attribution": "© 2023 Mapbox and its suppliers. All rights reserved. Use of this data is subject to the Mapbox Terms of Service. (https://www.mapbox.com/about/maps/)"
}
```

## Upgrade to Search Box API from Mapbox Geocoding API

For existing Mapbox Geocoding API customers, upgrading to the Search Box API provides access to up-to-date POI (Points of Interest) data, enhancing capabilities beyond the standard address geocoding provided by the Geocoding API.

You may consider the following steps when planning your upgrade:

### Update the Geocoding API endpoint in your application

To migrate to the Search Box API, update your application's API endpoints. See the following comparison how endpoints of both products offer.

-   equivalent of **Forward Geocoding** endpoints in Search Box API are [`/suggest`](#get-suggested-results) and [`/retrieve`](#retrieve-a-suggested-feature) and [`/forward`](#search-request)
-   equivalent of **Reverse Geocoding** endpoints in Search Box API is [`/reverse`](#reverse-lookup)

Search Box API can be implemented by using search sessions or search requests.

#### Using search sessions

If your app includes an interactive search feature for users, use the `/suggest` and `/retrieve` endpoints of the Search Box API. While the user is typing the query, each keystroke will trigger the `/suggest` endpoint, and selecting a search result will trigger the `/retrieve` endpoint. This use case is different from how Geocoding API works; where each keystroke triggers a `/forward` Geocoding API request.

Using `/suggest` and `/retrieve` endpoints together will create a billing session, and your requests will be charged based on [session-based pricing](#session-billing).

#### Using search requests

You can also send one-off search request to the `/forward` endpoint of the Search Box API. This is like using Geocoding API's /forward endpoint. This endpoint is billed per request.

### Update your app to with the new response schema

Both Geocoding API and Search Box API returns GeoJSON objects as the search response, but there are slight differences in the naming and the scope of the attributes. when upgrading, you need to update your application's data schema. If you are using Mapbox Search SDK, consider utilizing the provided classes for the Search Box API.

### Control your response

The Search Box API empowers developers to tailor search results according to specific needs. This includes the ability to include or exclude certain categories of Points of Interest (POIs) in the responses. By configuring parameters, developers can determine the types of features (such as localities, addresses, and places of interest) that appear in the search results.

### Understand how billing works for both APIs

The Geocoding API operates on a per-request billing model, where each call to the API incurs a separate charge. In contrast, the Search Box API offers flexible billing options, supporting both per-session and per-request pricing, depending on the endpoints utilized.

When transitioning from the per-request model of the Geocoding API to the session-based model of the Search Box API, you can calculate the estimated number of Search Box API sessions by dividing your total number of Geocoding API requests by the average number of interactions needed to complete a search. For instance, if users of a mobile application typically engage with 7 keystrokes to complete their search, what before resulted in 8 individual requests in the Geocoding API would now correspond to a single session in the Search Box API.

For more details, review [Mapbox Search Pricing](https://www.mapbox.com/pricing#search).

## Administrative unit types

Various types of administrative units are available via the Search Box API. Any type might appear as a top-level response, as context in a top-level response, or as a filtering option using the optional `types` parameter. See the following table for available administrative unit types.

| Administrative unit type | Description |
| --- | --- |
| `country` | Generally recognized countries or, in some cases like Hong Kong, an area of quasi-national administrative status that has a designated country code under [ISO 3166-1](https://www.iso.org/iso-3166-country-codes.html). |
| `region` | Top-level sub-national administrative features, such as states in the United States or provinces in Canada or China. |
| `postcode` | Postal codes used in country-specific national addressing systems. |
| `district` | Features that are smaller than top-level administrative features but typically larger than cities, in countries that use such an additional layer in postal addressing (for example, prefectures in China). |
| `place` | Typically these are cities, villages, municipalities, etc. They're usually features used in postal addressing, and are suitable for display in ambient end-user applications where current-location context is needed (for example, in weather displays). |
| `locality` | Official sub-city features present in countries where such an additional administrative layer is used in postal addressing, or where such features are commonly referred to in local parlance. Examples include city districts in Brazil and Chile and arrondissements in France. |
| `neighborhood` | Colloquial sub-city features often referred to in local parlance. Unlike `locality` features, these typically lack official status and may lack universally agreed-upon boundaries. Not available for reverse lookup requests. |
| `street` | The street, with no house number. |
| `address` | Individual residential or business addresses as a street with house number. |

## Language and Geography Support

### Supported languages

The Search Box API supports text queries in following languages; Czech, Croatian, Danish, Dutch, English, Estonian, Finnish, French, German, Greek, Hungarian, Italian, Japanese, Lithuanian, Latvian, Polish, Portuguese, Romanian, Russian, Slovak, Slovenian, Spanish, Swedish, Turkish, Ukrainian.

You can set a language by providing supported IETF language tags to the language API parameter. You can also provide a comma separated list of language codes. In this case, the first supported language encountered in the list will be used to process the request.

### Supported geographies

The Search Box API supports United States, Canada and Europe.

## Search Box API errors

<table><thead><tr><th>Response body <code>message</code></th><th>HTTP error code</th><th>Description</th></tr></thead><tbody><tr><td><code>Not authorized</code></td><td><code>401</code></td><td>Check the <a href="https://docs.mapbox.com/help/glossary/access-token/">access token</a> used in the query.</td></tr><tr><td><code>Bad request</code></td><td><code>400</code></td><td>Check the request for syntax errors in the <a href="#search-box-api-endpoints">endpoint</a>, path parameters, and query parameters.</td></tr><tr><td><code>Forbidden</code></td><td><code>403</code></td><td>There may be an issue with your account. Check your <a href="https://console.mapbox.com/">Account page</a> for more details.<br><br>In some cases, using an access tokens with URL restrictions can also result in a <code>403</code> error. For more information, see our <a href="https://docs.mapbox.com/accounts/guides/tokens/#url-restrictions">Token management guide</a>.</td></tr></tbody></table>

## Search Box API restrictions and limits

-   The Mapbox Terms of Service state that all data returned by the Search Box API endpoints is only available for temporary use. If your use case requires storing position data, contact [Mapbox sales](https://www.mapbox.com/contact/sales/).
-   The default rate limit for the Mapbox Search Box API is 10 requests per second. If you require a higher rate limit, contact [Mapbox Sales](https://www.mapbox.com/contact/sales/).
-   Calls to the Search Box API's [`/suggest`](#get-suggested-results) and [`/retrieve`](#retrieve-a-suggested-feature) endpoints must include a `session_token` parameter. Each API call in a *search session* counts individually against the rate limit. For example, 10 sequential calls to `/suggest` with the same `session_token` and one call to `/retrieve` are 11 requests per the rate limit, but are billed as belonging to a single session. Each concurrent session must use a distinct `session_token` value. See more about how the Search Box API is billed in the [Session Billing](#session-billing) section of this documentation.

## Search Box API pricing

Pricing for the Mapbox Search Box API is based on which API endpoints are used. If you are using the /suggest or /retrieve endpoints, usage will be billed per search session. If you are using the /category or /reverse endpoints, usage will be billed per request.

For more details, review [Mapbox Search Pricing](https://www.mapbox.com/pricing#search).

### Session Billing

A Search Session is a series of Search API calls bundled together for billing purposes. The Search Box API's [`/suggest`](#get-suggested-results) and [`/retrieve`](#retrieve-a-suggested-feature) endpoints must include a `session_token` parameter, which groups a series of requests together into one *session*.

Each concurrent session must use a distinct `session_token` value. Reusing a token across concurrent sessions may result in unpredictable billing.

The following actions will end a session:

-   Calling `/suggest` followed by a call to `/retrieve` with a common `session_token`.
-   Calling `/suggest` without a following `/retrieve` call within 180 seconds.
-   50 successive calls to `/suggest` with a common `session_token`.

Each completed session, regardless of how it ends, counts as one billable session.

---

**Documentation for Mapbox Search API (earlier release) is available at [https://docs.mapbox.com/search/search/](https://docs.mapbox.com/api/search/search/).**
