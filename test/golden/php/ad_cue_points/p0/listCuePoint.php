<?php
require_once('../../lib/KalturaClient.php');
require_once('Credentials.php');

$config = new KalturaConfiguration(PARTNER_ID);
$config->serviceUrl = "https://www.kaltura.com/";
$client = new KalturaClient($config);
$ks = $client->session->start(
  SECRET,
  USER_ID,
  SESSION_TYPE,
  PARTNER_ID,
  null, null);
$client->setKS($ks);

$filter = new KalturaCuePointFilter();
$filter->entryIdEqual = "1_318vzqcr";

$pager = new KalturaFilterPager();


try {
  $result = $client->cuePoint->listAction(
    $filter, 
    $pager);
  $result = (object)$result->objects;
  require 'KalturaCuePointListResponse.php';
} catch (Exception $e) {
  $result = array(
    code => $e->getCode(),
    message => $e->getMessage()
  );
  $result = (object)$result;
  require 'KalturaCuePointListResponse.php';
}
?>