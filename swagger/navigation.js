var fs = require('fs');
var Swagger = module.exports = require('kaltura-spec-converter').swagger;

function readMD(name) {
  return fs.readFileSync(__dirname + '/markdown/' + name + '.md', 'utf8');
}
for (var key in Swagger['x-enums']) {
  Swagger.definitions[key] = Swagger['x-enums'][key];
}
var definitions = Object.keys(Swagger.definitions).map(function(defName) {
  return {title: defName, definition: defName}
});
function isEnum(defTag) {
  var def = Swagger.definitions[defTag.definition];
  return def.oneOf && def.oneOf[0] && def.oneOf[0].enum;
}

var groups = module.exports = [{
  title: "Overview",
  contents: readMD('overview'),
}, {
  title: "Client Libraries",
  contents: require('./client_libraries.js'),
}, {
  title: "XML Schemas",
  contents: readMD('schemas'),
  children: require('./schemas.js'),
}, {
  title: "Generate API Sessions",
  children: [
    {tag: "session"},
    {tag: "appToken"},
    {operation: 'user.loginByLoginId'},
  ],
}, {
  title: "Ingest and Upload Media",
  children: [
    {tag: "uploadToken"},
    {tag: "media"},
    {tag: "captionAsset"},
    {tag: "captionParams"},
    {tag: "thumbAsset"},
    {tag: "attachmentAsset"},
    {tag: "externalMedia"},
    {tag: "upload", hidden: true},
  ],
}, {
  title: "Execute Bulk Ingest and Updates",
  children: [
    {operation: "media.bulkUploadAdd"},
    {operation: "user.addFromBulkUpload"},
    {operation: "category.addFromBulkUpload"},
    {operation: "cuePoint.addFromBulk"},
    {operation: "categoryEntry.addFromBulkUpload"},
    {operation: "categoryUser.addFromBulkUpload"},
    {tag: "bulk"},
    {tag: "schema"},
    {tag: "dropFolder"},
    {tag: "dropFolderFile"},
    {tag: "virusScanProfile", hidden: true},
    {tag: "aspera", hidden: true},
    {tag: "bulkUpload", hidden: true},
  ],
}, {
  title: "Convert and Transcode Media",
  children: [
    {tag: "flavorAsset"},
    {tag: "flavorParams"},
    {tag: "flavorParamsOutput"},
    {tag: "conversionProfile"},
    {tag: "conversionProfileAssetParams"},
    {tag: "mediaInfo"},
  ],
}, {
  title: "Live Stream and Broadcast",
  children: [
    {tag: "liveStream"},
  ],
}, {
  title: "Enrich and Organize Metadata",
  children: [
    {tag: "baseEntry"},
    {tag: "category"},
    {tag: "categoryEntry"},
    {tag: "categoryUser"},
    {tag: "metadata"},
    {tag: "metadataProfile"},
    {tag: "captionAsset"},
    {tag: "captionParams"},
    {tag: "captionAssetItem"},
    {tag: "attachmentAsset"},
    {tag: "thumbAsset"},
    {tag: "thumbParams"},
    {tag: "tag"},
  ],
}, {
  title: "Search, Discover and Personalize",
  children: [
    {operation: "baseEntry.list"},
    {tag: "captionAssetItem"},
    {tag: "playlist"},
    {tag: "like"},
    {tag: "shortLink"},
    {tag: "tag"},
    {tag: "user"},
    {tag: "groupUser"},
  ],
}, {
  title: "Engage and Publish",
  children: [
    {tag: "playlist"},
    {tag: "thumbnail"},
    {tag: "cuePoint"},
    {tag: "quiz"},
    {tag: "userEntry"},
    {tag: "like"},
    {tag: "uiConf"},
    {tag: "annotation", hidden: true},
  ],
}, {
  title: "Review Media Analytics",
  children: [
    {tag: "report"},
    {tag: "liveReports"},
    {tag: "liveStats"},
    {tag: "stats"},
  ],
}, {
  title: "Deliver and Distribute Media",
  children: [
    {tag: "playManifest"},
    {tag: "syndicationFeed"},
    {tag: "entryDistribution"},
    {tag: "distributionProfile"},
    {tag: "distributionProvider"},
    {tag: "deliveryProfile", hidden: true},
    {tag: "storageProfile", hidden: true},
  ],
}, {
  title: "Secure, Control and Govern",
  children: [
    {tag: "partner"},
    {tag: "user"},
    {tag: "userRole"},
    {tag: "groupUser"},
    {tag: "accessControlProfile"},
    {tag: "categoryEntry"},
    {tag: "categoryUser"},
    {tag: "permission"},
    {tag: "permissionItem"},
    {tag: "accessControl", hidden: true},
    {tag: "adminUser", hidden: true},
    {tag: "auditTrail", hidden: true},
  ],
}, {
  title: "Optimize API Requests",
  children: [
    {tag: "multirequest"},
    {tag: "responseProfile"},
  ],
}, {
  title: "Process and Integrate with Hooks",
  children: [
    {tag: "eventNotificationTemplate"},
    {tag: "scheduledTaskProfile"},
    {tag: "integration"},
    {tag: "businessProcessCase"},
    {tag: "notification", hidden: true},
  ],
}, {
  title: "Encrypt and License Content",
  children: [
    {tag: "drmLicenseAccess"},
    {tag: "drmPolicy"},
    {tag: "drmProfile"},
    {tag: "playReadyDrm"},
    {tag: "widevineDrm"},
    {tag: "deliveryProfile", hidden: true},
  ],
}, {
  title: "Manage Documents and Other Assets",
  children: [
    {tag: "baseEntry"},
    {tag: "data"},
    {tag: "documents"},
  ],
}, {
  title: "Manage and Deliver Apps and Widgets",
  children: [
    {tag: "uiConf"},
    {tag: "widget"},
    {tag: "fileAsset"},
    {tag: "captureSpace"},
  ],
}, {
  title: "Manage Backend and Storage",
  children: [
    {tag: "system"},
    {tag: "storageProfile", hidden: true},
  ],
}, {
  title: "General Objects",
  children: [{
    title: "Objects",
    children: definitions.filter(d => !isEnum(d)).filter(d => d.definition.indexOf('Filter') === -1),
  }, {
    title: "Enums",
    children: definitions.filter(isEnum),
  }, {
    title: "Filters",
    children: definitions.filter(d => d.definition.indexOf('Filter') !== -1),
  }],
}, {
  title: "Error Codes",
  contents: readMD('errors'),
}]

groups.forEach(function(g) {
  if (!g.operation && !g.tag && !g.contents) {
    g.contents = '# ' + g.title;
  }
})
