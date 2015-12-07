## geo-web-toolkit migration help

During the process of adding support for both OpenLayers 2 and OpenLayers 3 to the geo-web-toolkit, some changes were made to accommodate OpenLayers 3 and also to improve the API for developers.

This document contains a list of the breaking changes from the original directives supporting OpenLayers 2 and how to use them to support either 2 or 3 if need be.

### Sacrifices and Limitations

OpenLayers 3 and OpenLayers 2 don't have the same feature sets, so some of the changes are to make it easy to for developers using the toolkit to identify this mismatch and give suggestions.

Both OpenLayers frameworks provide a great set of functionality and flexibility. The geo-web-toolkit tries to focus on the most common use cases and make them easy to use through the use of AngularJS (1) directives.
This is to make it possible to get an interactive map on the screen without writing/generating JS for the client for common use cases.
This allows developers working with server side technologies not having to worry about dynamically generating JS for the client and instead use semantic element names which are easy to use and maintain.

With that focus, **not all functionality** may be available from the geo-web-toolkit. This will be extended as OpenLayers 3 and other mapping frameworks develop, whilst still having a focus of getting data on the screen quickly and easily.

### Breaking changes

1. `center-position` value has changed from `{ lon: '', lat:'' }` object to a coordinate array `[2]`, eg, `[110,-24]`
2. Google map layers have been moved into their own directives rather than a `layer-type`. // TODO

For example, now they can be used as a `<geo-maps-google-layer></geo-maps-google-layer>` under a `<geo-map>`.
This is to allow for more vendor maps to be added as stand alone components, in the future it is expected more will be added with their own directive requiring the `<geo-map>` parent.

