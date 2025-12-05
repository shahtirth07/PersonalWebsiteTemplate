/**
 * Company configurations organized by ATS type
 * Each company entry includes:
 * - name: Company display name
 * - ats: ATS type (workday, greenhouse, lever, custom, etc.)
 * - careerUrl: Base URL for careers page
 * - apiEndpoint: API endpoint if available (for Workday/Greenhouse)
 * - priority: 1-5 (1 = highest priority, check more frequently)
 * - visaFriendly: true/false (known to sponsor H1B/OPT)
 */

export const companies = {
  // WORKDAY ATS (Most common for large tech companies)
  workday: [
    { name: 'Google (Alphabet)', careerUrl: 'https://careers.google.com', apiEndpoint: 'https://google.com/careers/api/jobs', priority: 1, visaFriendly: true },
    { name: 'Meta', careerUrl: 'https://www.metacareers.com', apiEndpoint: 'https://www.metacareers.com/careers/api/jobs', priority: 1, visaFriendly: true },
    { name: 'Microsoft', careerUrl: 'https://careers.microsoft.com', apiEndpoint: 'https://careers.microsoft.com/careers/api/jobs', priority: 1, visaFriendly: true },
    { name: 'Amazon', careerUrl: 'https://www.amazon.jobs', apiEndpoint: null, priority: 1, visaFriendly: true },
    { name: 'Apple', careerUrl: 'https://jobs.apple.com', apiEndpoint: null, priority: 1, visaFriendly: true },
    { name: 'Uber', careerUrl: 'https://www.uber.com/careers', apiEndpoint: null, priority: 1, visaFriendly: true },
    { name: 'Tesla', careerUrl: 'https://www.tesla.com/careers', apiEndpoint: null, priority: 1, visaFriendly: true },
    { name: 'IBM', careerUrl: 'https://www.ibm.com/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Oracle', careerUrl: 'https://www.oracle.com/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Adobe', careerUrl: 'https://careers.adobe.com', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Salesforce', careerUrl: 'https://www.salesforce.com/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'VMware', careerUrl: 'https://careers.vmware.com', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'SAP', careerUrl: 'https://jobs.sap.com', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Intuit', careerUrl: 'https://www.intuit.com/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Cisco', careerUrl: 'https://www.cisco.com/c/en/us/about/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Intel', careerUrl: 'https://www.intel.com/content/www/us/en/jobs/jobs-at-intel.html', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'NVIDIA', careerUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers', apiEndpoint: null, priority: 1, visaFriendly: true },
    { name: 'AMD', careerUrl: 'https://www.amd.com/en/corporate/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Qualcomm', careerUrl: 'https://www.qualcomm.com/company/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Broadcom', careerUrl: 'https://careers.broadcom.com', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'HP Inc.', careerUrl: 'https://jobs.hp.com', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'Hewlett Packard Enterprise (HPE)', careerUrl: 'https://careers.hpe.com', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'ServiceNow', careerUrl: 'https://www.servicenow.com/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Workday', careerUrl: 'https://www.workday.com/en-us/company/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'MongoDB', careerUrl: 'https://www.mongodb.com/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'NetApp', careerUrl: 'https://www.netapp.com/company/careers', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'Autodesk', careerUrl: 'https://www.autodesk.com/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Western Digital', careerUrl: 'https://jobs.westerndigital.com', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'Seagate', careerUrl: 'https://www.seagate.com/careers', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'Micron Technology', careerUrl: 'https://www.micron.com/careers', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'Texas Instruments', careerUrl: 'https://careers.ti.com', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'Honeywell Aerospace', careerUrl: 'https://careers.honeywell.com', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'Zebra Technologies', careerUrl: 'https://www.zebra.com/us/en/about-zebra/careers', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'Garmin', careerUrl: 'https://www.garmin.com/en-US/careers', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'Siemens Digital Industries', careerUrl: 'https://jobs.siemens.com', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'Ericsson', careerUrl: 'https://www.ericsson.com/en/careers', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'Nokia', careerUrl: 'https://www.nokia.com/about-us/careers', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'General Electric (GE Digital)', careerUrl: 'https://www.ge.com/careers', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'Xerox', careerUrl: 'https://www.xerox.com/en-us/jobs', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'Walmart Global Tech', careerUrl: 'https://careers.walmart.com/technology', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Target Tech', careerUrl: 'https://corporate.target.com/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'eBay', careerUrl: 'https://careers.ebayinc.com', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Etsy', careerUrl: 'https://www.etsy.com/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Wayfair', careerUrl: 'https://www.wayfair.com/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Chewy', careerUrl: 'https://www.chewy.com/jobs', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Epic Systems', careerUrl: 'https://careers.epic.com', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Electronic Arts (EA)', careerUrl: 'https://www.ea.com/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Activision Blizzard', careerUrl: 'https://www.activisionblizzard.com/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Riot Games', careerUrl: 'https://www.riotgames.com/en/work-with-us', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Epic Games', careerUrl: 'https://www.epicgames.com/site/en-US/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Take-Two Interactive', careerUrl: 'https://www.take2games.com/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Unity Technologies', careerUrl: 'https://careers.unity.com', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Netflix', careerUrl: 'https://jobs.netflix.com', apiEndpoint: null, priority: 1, visaFriendly: true },
    { name: 'Disney Streaming', careerUrl: 'https://jobs.disneycareers.com', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'JPMorgan Chase', careerUrl: 'https://careers.jpmorgan.com', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Goldman Sachs', careerUrl: 'https://www.goldmansachs.com/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Morgan Stanley', careerUrl: 'https://www.morganstanley.com/people/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Bank of America', careerUrl: 'https://careers.bankofamerica.com', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Citigroup', careerUrl: 'https://jobs.citi.com', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Capital One', careerUrl: 'https://www.capitalone.com/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'American Express', careerUrl: 'https://www.americanexpress.com/en-us/careers', apiEndpoint: null, priority: 2, visaFriendly: true },
    { name: 'Accenture', careerUrl: 'https://www.accenture.com/us-en/careers', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'Deloitte', careerUrl: 'https://www2.deloitte.com/us/en/careers', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'PwC', careerUrl: 'https://www.pwc.com/us/en/careers', apiEndpoint: null, priority: 3, visaFriendly: true },
    { name: 'KPMG', careerUrl: 'https://www.kpmguscareers.com', apiEndpoint: null, priority: 3, visaFriendly: true },
  ],

  // GREENHOUSE ATS
  greenhouse: [
    { name: 'Atlassian', careerUrl: 'https://www.atlassian.com/company/careers', apiEndpoint: 'https://boards.greenhouse.io/atlassian', priority: 2, visaFriendly: true },
    { name: 'Stripe', careerUrl: 'https://stripe.com/jobs', apiEndpoint: 'https://boards.greenhouse.io/stripe', priority: 1, visaFriendly: true },
    { name: 'Slack', careerUrl: 'https://slack.com/careers', apiEndpoint: 'https://boards.greenhouse.io/slack', priority: 2, visaFriendly: true },
    { name: 'Palantir', careerUrl: 'https://www.palantir.com/careers', apiEndpoint: 'https://boards.greenhouse.io/palantir', priority: 1, visaFriendly: true },
    { name: 'Airbnb', careerUrl: 'https://careers.airbnb.com', apiEndpoint: 'https://boards.greenhouse.io/airbnb', priority: 1, visaFriendly: true },
    { name: 'Spotify', careerUrl: 'https://www.spotifyjobs.com', apiEndpoint: 'https://boards.greenhouse.io/spotify', priority: 2, visaFriendly: true },
    { name: 'Dropbox', careerUrl: 'https://www.dropbox.com/jobs', apiEndpoint: 'https://boards.greenhouse.io/dropbox', priority: 2, visaFriendly: true },
    { name: 'Square', careerUrl: 'https://squareup.com/us/en/careers', apiEndpoint: 'https://boards.greenhouse.io/square', priority: 2, visaFriendly: true },
    { name: 'PayPal', careerUrl: 'https://www.paypal.com/us/webapps/mpp/jobs', apiEndpoint: 'https://boards.greenhouse.io/paypal', priority: 2, visaFriendly: true },
    { name: 'Lyft', careerUrl: 'https://www.lyft.com/careers', apiEndpoint: 'https://boards.greenhouse.io/lyft', priority: 2, visaFriendly: true },
    { name: 'Twilio', careerUrl: 'https://www.twilio.com/company/jobs', apiEndpoint: 'https://boards.greenhouse.io/twilio', priority: 2, visaFriendly: true },
    { name: 'Splunk', careerUrl: 'https://www.splunk.com/en_us/careers', apiEndpoint: 'https://boards.greenhouse.io/splunk', priority: 2, visaFriendly: true },
    { name: 'Fitbit', careerUrl: 'https://www.fitbit.com/careers', apiEndpoint: 'https://boards.greenhouse.io/fitbit', priority: 3, visaFriendly: true },
    { name: 'Zendesk', careerUrl: 'https://www.zendesk.com/jobs', apiEndpoint: 'https://boards.greenhouse.io/zendesk', priority: 2, visaFriendly: true },
    { name: 'Snowflake', careerUrl: 'https://careers.snowflake.com', apiEndpoint: 'https://boards.greenhouse.io/snowflake', priority: 1, visaFriendly: true },
    { name: 'Coinbase', careerUrl: 'https://www.coinbase.com/careers', apiEndpoint: 'https://boards.greenhouse.io/coinbase', priority: 2, visaFriendly: true },
    { name: 'Shopify', careerUrl: 'https://www.shopify.com/careers', apiEndpoint: 'https://boards.greenhouse.io/shopify', priority: 2, visaFriendly: true },
    { name: 'Asana', careerUrl: 'https://asana.com/jobs', apiEndpoint: 'https://boards.greenhouse.io/asana', priority: 2, visaFriendly: true },
    { name: 'Flexport', careerUrl: 'https://www.flexport.com/careers', apiEndpoint: 'https://boards.greenhouse.io/flexport', priority: 2, visaFriendly: true },
    { name: 'Tripadvisor', careerUrl: 'https://careers.tripadvisor.com', apiEndpoint: 'https://boards.greenhouse.io/tripadvisor', priority: 2, visaFriendly: true },
    { name: 'Samsara', careerUrl: 'https://www.samsara.com/careers', apiEndpoint: 'https://boards.greenhouse.io/samsara', priority: 2, visaFriendly: true },
    { name: 'Instacart', careerUrl: 'https://www.instacart.com/careers', apiEndpoint: 'https://boards.greenhouse.io/instacart', priority: 2, visaFriendly: true },
    { name: 'Yelp', careerUrl: 'https://www.yelp.com/careers', apiEndpoint: 'https://boards.greenhouse.io/yelp', priority: 2, visaFriendly: true },
    { name: 'Cloudera', careerUrl: 'https://www.cloudera.com/careers', apiEndpoint: 'https://boards.greenhouse.io/cloudera', priority: 3, visaFriendly: true },
    { name: 'Robinhood', careerUrl: 'https://robinhood.com/us/en/careers', apiEndpoint: 'https://boards.greenhouse.io/robinhood', priority: 2, visaFriendly: true },
    { name: 'SoFi', careerUrl: 'https://www.sofi.com/careers', apiEndpoint: 'https://boards.greenhouse.io/sofi', priority: 2, visaFriendly: true },
    { name: 'Venmo', careerUrl: 'https://venmo.com/careers', apiEndpoint: 'https://boards.greenhouse.io/venmo', priority: 2, visaFriendly: true },
    { name: 'Anthropic', careerUrl: 'https://www.anthropic.com/careers', apiEndpoint: 'https://boards.greenhouse.io/anthropic', priority: 1, visaFriendly: true },
    { name: 'OpenAI', careerUrl: 'https://openai.com/careers', apiEndpoint: 'https://boards.greenhouse.io/openai', priority: 1, visaFriendly: true },
    { name: 'Cohere', careerUrl: 'https://cohere.com/careers', apiEndpoint: 'https://boards.greenhouse.io/cohere', priority: 2, visaFriendly: true },
    { name: 'Scale AI', careerUrl: 'https://scale.com/careers', apiEndpoint: 'https://boards.greenhouse.io/scale', priority: 1, visaFriendly: true },
    { name: 'Stability AI', careerUrl: 'https://stability.ai/careers', apiEndpoint: 'https://boards.greenhouse.io/stabilityai', priority: 2, visaFriendly: true },
    { name: 'Databricks', careerUrl: 'https://www.databricks.com/company/careers', apiEndpoint: 'https://boards.greenhouse.io/databricks', priority: 1, visaFriendly: true },
    { name: 'HuggingFace', careerUrl: 'https://huggingface.co/careers', apiEndpoint: 'https://boards.greenhouse.io/huggingface', priority: 1, visaFriendly: true },
    { name: 'Character.AI', careerUrl: 'https://character.ai/careers', apiEndpoint: 'https://boards.greenhouse.io/character', priority: 2, visaFriendly: true },
    { name: 'Anduril Industries', careerUrl: 'https://www.anduril.com/careers', apiEndpoint: 'https://boards.greenhouse.io/anduril', priority: 2, visaFriendly: true },
    { name: 'Shield AI', careerUrl: 'https://www.shield.ai/careers', apiEndpoint: 'https://boards.greenhouse.io/shieldai', priority: 2, visaFriendly: true },
    { name: 'Adept AI', careerUrl: 'https://www.adept.ai/careers', apiEndpoint: 'https://boards.greenhouse.io/adept', priority: 2, visaFriendly: true },
    { name: 'Weights & Biases', careerUrl: 'https://wandb.ai/careers', apiEndpoint: 'https://boards.greenhouse.io/wandb', priority: 2, visaFriendly: true },
    { name: 'SambaNova Systems', careerUrl: 'https://sambanova.ai/careers', apiEndpoint: 'https://boards.greenhouse.io/sambanova', priority: 2, visaFriendly: true },
    { name: 'Elastic (ElasticSearch)', careerUrl: 'https://www.elastic.co/careers', apiEndpoint: 'https://boards.greenhouse.io/elastic', priority: 2, visaFriendly: true },
    { name: 'Datadog', careerUrl: 'https://www.datadoghq.com/careers', apiEndpoint: 'https://boards.greenhouse.io/datadog', priority: 1, visaFriendly: true },
    { name: 'Cloudflare', careerUrl: 'https://www.cloudflare.com/careers', apiEndpoint: 'https://boards.greenhouse.io/cloudflare', priority: 1, visaFriendly: true },
    { name: 'Fastly', careerUrl: 'https://www.fastly.com/careers', apiEndpoint: 'https://boards.greenhouse.io/fastly', priority: 2, visaFriendly: true },
    { name: 'Akamai', careerUrl: 'https://www.akamai.com/careers', apiEndpoint: 'https://boards.greenhouse.io/akamai', priority: 2, visaFriendly: true },
    { name: 'Hashicorp', careerUrl: 'https://www.hashicorp.com/careers', apiEndpoint: 'https://boards.greenhouse.io/hashicorp', priority: 2, visaFriendly: true },
    { name: 'DigitalOcean', careerUrl: 'https://www.digitalocean.com/careers', apiEndpoint: 'https://boards.greenhouse.io/digitalocean', priority: 2, visaFriendly: true },
    { name: 'PagerDuty', careerUrl: 'https://www.pagerduty.com/careers', apiEndpoint: 'https://boards.greenhouse.io/pagerduty', priority: 2, visaFriendly: true },
    { name: 'New Relic', careerUrl: 'https://newrelic.com/careers', apiEndpoint: 'https://boards.greenhouse.io/newrelic', priority: 2, visaFriendly: true },
    { name: 'Confluent', careerUrl: 'https://www.confluent.io/careers', apiEndpoint: 'https://boards.greenhouse.io/confluent', priority: 2, visaFriendly: true },
    { name: 'Lucid Software', careerUrl: 'https://www.lucid.co/careers', apiEndpoint: 'https://boards.greenhouse.io/lucid', priority: 2, visaFriendly: true },
    { name: 'MathWorks', careerUrl: 'https://www.mathworks.com/company/jobs', apiEndpoint: 'https://boards.greenhouse.io/mathworks', priority: 2, visaFriendly: true },
    { name: 'Ansys', careerUrl: 'https://www.ansys.com/careers', apiEndpoint: 'https://boards.greenhouse.io/ansys', priority: 2, visaFriendly: true },
    { name: 'DoorDash', careerUrl: 'https://careers.doordash.com', apiEndpoint: 'https://boards.greenhouse.io/doordash', priority: 2, visaFriendly: true },
    { name: 'Grubhub', careerUrl: 'https://careers.grubhub.com', apiEndpoint: 'https://boards.greenhouse.io/grubhub', priority: 2, visaFriendly: true },
    { name: 'Postmates', careerUrl: 'https://careers.postmates.com', apiEndpoint: 'https://boards.greenhouse.io/postmates', priority: 2, visaFriendly: true },
    { name: 'Rivian', careerUrl: 'https://rivian.com/careers', apiEndpoint: 'https://boards.greenhouse.io/rivian', priority: 2, visaFriendly: true },
    { name: 'Lucid Motors', careerUrl: 'https://www.lucidmotors.com/careers', apiEndpoint: 'https://boards.greenhouse.io/lucidmotors', priority: 2, visaFriendly: true },
    { name: 'GM / Cruise', careerUrl: 'https://getcruise.com/careers', apiEndpoint: 'https://boards.greenhouse.io/cruise', priority: 2, visaFriendly: true },
    { name: 'Zoox', careerUrl: 'https://zoox.com/careers', apiEndpoint: 'https://boards.greenhouse.io/zoox', priority: 2, visaFriendly: true },
    { name: 'Aurora Innovation', careerUrl: 'https://aurora.tech/careers', apiEndpoint: 'https://boards.greenhouse.io/aurora', priority: 2, visaFriendly: true },
    { name: 'Nuro', careerUrl: 'https://www.nuro.ai/careers', apiEndpoint: 'https://boards.greenhouse.io/nuro', priority: 2, visaFriendly: true },
    { name: 'Boston Dynamics', careerUrl: 'https://www.bostondynamics.com/careers', apiEndpoint: 'https://boards.greenhouse.io/bostondynamics', priority: 2, visaFriendly: true },
    { name: 'SpaceX', careerUrl: 'https://www.spacex.com/careers', apiEndpoint: 'https://boards.greenhouse.io/spacex', priority: 1, visaFriendly: false },
    { name: 'Blue Origin', careerUrl: 'https://www.blueorigin.com/careers', apiEndpoint: 'https://boards.greenhouse.io/blueorigin', priority: 2, visaFriendly: false },
    { name: 'Relativity Space', careerUrl: 'https://www.relativityspace.com/careers', apiEndpoint: 'https://boards.greenhouse.io/relativityspace', priority: 2, visaFriendly: false },
    { name: 'Joby Aviation', careerUrl: 'https://www.jobyaviation.com/careers', apiEndpoint: 'https://boards.greenhouse.io/joby', priority: 2, visaFriendly: false },
    { name: 'Epic Systems', careerUrl: 'https://careers.epic.com', apiEndpoint: 'https://boards.greenhouse.io/epic', priority: 2, visaFriendly: true },
    { name: 'Cerner (Oracle Health)', careerUrl: 'https://www.cerner.com/careers', apiEndpoint: 'https://boards.greenhouse.io/cerner', priority: 2, visaFriendly: true },
    { name: 'Flatiron Health', careerUrl: 'https://flatiron.com/careers', apiEndpoint: 'https://boards.greenhouse.io/flatiron', priority: 2, visaFriendly: true },
    { name: 'Tempus AI', careerUrl: 'https://www.tempus.com/careers', apiEndpoint: 'https://boards.greenhouse.io/tempus', priority: 2, visaFriendly: true },
    { name: 'Guardant Health', careerUrl: 'https://guardanthealth.com/careers', apiEndpoint: 'https://boards.greenhouse.io/guardant', priority: 2, visaFriendly: true },
    { name: '23andMe', careerUrl: 'https://www.23andme.com/careers', apiEndpoint: 'https://boards.greenhouse.io/23andme', priority: 2, visaFriendly: true },
    { name: 'Illumina', careerUrl: 'https://www.illumina.com/careers', apiEndpoint: 'https://boards.greenhouse.io/illumina', priority: 2, visaFriendly: true },
    { name: 'Cue Health', careerUrl: 'https://cuehealth.com/careers', apiEndpoint: 'https://boards.greenhouse.io/cue', priority: 2, visaFriendly: true },
    { name: 'Butterfly Network', careerUrl: 'https://www.butterflynetwork.com/careers', apiEndpoint: 'https://boards.greenhouse.io/butterfly', priority: 2, visaFriendly: true },
    { name: 'Ro Health', careerUrl: 'https://ro.co/careers', apiEndpoint: 'https://boards.greenhouse.io/ro', priority: 2, visaFriendly: true },
    { name: 'Omada Health', careerUrl: 'https://www.omadahealth.com/careers', apiEndpoint: 'https://boards.greenhouse.io/omada', priority: 2, visaFriendly: true },
    { name: 'Valve', careerUrl: 'https://www.valvesoftware.com/en/about', apiEndpoint: 'https://boards.greenhouse.io/valve', priority: 2, visaFriendly: true },
    { name: 'Niantic', careerUrl: 'https://nianticlabs.com/jobs', apiEndpoint: 'https://boards.greenhouse.io/niantic', priority: 2, visaFriendly: true },
    { name: 'Brex', careerUrl: 'https://www.brex.com/careers', apiEndpoint: 'https://boards.greenhouse.io/brex', priority: 2, visaFriendly: true },
    { name: 'Ramp', careerUrl: 'https://ramp.com/careers', apiEndpoint: 'https://boards.greenhouse.io/ramp', priority: 2, visaFriendly: true },
    { name: 'Notion', careerUrl: 'https://www.notion.so/careers', apiEndpoint: 'https://boards.greenhouse.io/notion', priority: 1, visaFriendly: true },
    { name: 'Figma', careerUrl: 'https://www.figma.com/careers', apiEndpoint: 'https://boards.greenhouse.io/figma', priority: 1, visaFriendly: true },
    { name: 'Airtable', careerUrl: 'https://airtable.com/careers', apiEndpoint: 'https://boards.greenhouse.io/airtable', priority: 1, visaFriendly: true },
    { name: 'Plaid', careerUrl: 'https://plaid.com/careers', apiEndpoint: 'https://boards.greenhouse.io/plaid', priority: 1, visaFriendly: true },
    { name: 'Rippling', careerUrl: 'https://www.rippling.com/careers', apiEndpoint: 'https://boards.greenhouse.io/rippling', priority: 2, visaFriendly: true },
    { name: 'Gusto', careerUrl: 'https://gusto.com/careers', apiEndpoint: 'https://boards.greenhouse.io/gusto', priority: 2, visaFriendly: true },
    { name: 'Benchling', careerUrl: 'https://www.benchling.com/careers', apiEndpoint: 'https://boards.greenhouse.io/benchling', priority: 2, visaFriendly: true },
    { name: 'Grammarly', careerUrl: 'https://www.grammarly.com/careers', apiEndpoint: 'https://boards.greenhouse.io/grammarly', priority: 2, visaFriendly: true },
    { name: 'Duolingo', careerUrl: 'https://www.duolingo.com/careers', apiEndpoint: 'https://boards.greenhouse.io/duolingo', priority: 2, visaFriendly: true },
    { name: 'Khan Academy', careerUrl: 'https://www.khanacademy.org/careers', apiEndpoint: 'https://boards.greenhouse.io/khanacademy', priority: 2, visaFriendly: true },
    { name: 'Affirm', careerUrl: 'https://www.affirm.com/careers', apiEndpoint: 'https://boards.greenhouse.io/affirm', priority: 2, visaFriendly: true },
    { name: 'CloudKitchens', careerUrl: 'https://www.cloudkitchens.com/careers', apiEndpoint: 'https://boards.greenhouse.io/cloudkitchens', priority: 2, visaFriendly: true },
    { name: 'Verkada', careerUrl: 'https://www.verkada.com/careers', apiEndpoint: 'https://boards.greenhouse.io/verkada', priority: 2, visaFriendly: true },
    { name: 'Dataminr', careerUrl: 'https://www.dataminr.com/careers', apiEndpoint: 'https://boards.greenhouse.io/dataminr', priority: 2, visaFriendly: true },
  ],

  // LEVER ATS
  lever: [
    { name: 'LinkedIn', careerUrl: 'https://www.linkedin.com/company/linkedin/jobs', apiEndpoint: 'https://api.lever.co/v0/postings/linkedin', priority: 1, visaFriendly: true },
    { name: 'Snap', careerUrl: 'https://www.snap.com/en-US/careers', apiEndpoint: 'https://api.lever.co/v0/postings/snap', priority: 2, visaFriendly: true },
    { name: 'Bloomberg', careerUrl: 'https://www.bloomberg.com/careers', apiEndpoint: 'https://api.lever.co/v0/postings/bloomberg', priority: 1, visaFriendly: true },
    { name: 'Red Hat (IBM)', careerUrl: 'https://www.redhat.com/en/jobs', apiEndpoint: 'https://api.lever.co/v0/postings/redhat', priority: 2, visaFriendly: true },
    { name: 'GitHub (Microsoft)', careerUrl: 'https://github.com/careers', apiEndpoint: 'https://api.lever.co/v0/postings/github', priority: 1, visaFriendly: true },
  ],

  // CUSTOM/OTHER ATS (Requires custom scraping)
  custom: [
    { name: 'Amazon', careerUrl: 'https://www.amazon.jobs', apiEndpoint: null, priority: 1, visaFriendly: true, scraper: 'amazon' },
    { name: 'Apple', careerUrl: 'https://jobs.apple.com', apiEndpoint: null, priority: 1, visaFriendly: true, scraper: 'apple' },
    { name: 'Samsung Research America', careerUrl: 'https://www.sra.samsung.com/careers', apiEndpoint: null, priority: 2, visaFriendly: true, scraper: 'samsung' },
    { name: 'LG Electronics North America', careerUrl: 'https://www.lg.com/us/careers', apiEndpoint: null, priority: 3, visaFriendly: true, scraper: 'lg' },
    { name: 'Two Sigma', careerUrl: 'https://www.twosigma.com/careers', apiEndpoint: null, priority: 1, visaFriendly: true, scraper: 'twosigma' },
    { name: 'Jane Street', careerUrl: 'https://www.janestreet.com/join-jane-street', apiEndpoint: null, priority: 1, visaFriendly: true, scraper: 'janestreet' },
    { name: 'Hudson River Trading (HRT)', careerUrl: 'https://www.hudsonrivertrading.com/careers', apiEndpoint: null, priority: 1, visaFriendly: true, scraper: 'hrt' },
    { name: 'Akuna Capital', careerUrl: 'https://akunacapital.com/careers', apiEndpoint: null, priority: 1, visaFriendly: true, scraper: 'akuna' },
    { name: 'Optiver', careerUrl: 'https://www.optiver.com/working-at-optiver', apiEndpoint: null, priority: 1, visaFriendly: true, scraper: 'optiver' },
    { name: 'DRW Trading', careerUrl: 'https://drw.com/careers', apiEndpoint: null, priority: 1, visaFriendly: true, scraper: 'drw' },
    { name: 'IMC Trading', careerUrl: 'https://www.imc.com/us/careers', apiEndpoint: null, priority: 1, visaFriendly: true, scraper: 'imc' },
    { name: 'Citadel', careerUrl: 'https://www.citadel.com/careers', apiEndpoint: null, priority: 1, visaFriendly: true, scraper: 'citadel' },
    { name: 'Citadel Securities', careerUrl: 'https://www.citadelsecurities.com/careers', apiEndpoint: null, priority: 1, visaFriendly: true, scraper: 'citadel' },
    { name: 'DeepMind (Alphabet)', careerUrl: 'https://www.deepmind.com/careers', apiEndpoint: null, priority: 1, visaFriendly: true, scraper: 'deepmind' },
    { name: 'Infosys', careerUrl: 'https://www.infosys.com/careers', apiEndpoint: null, priority: 3, visaFriendly: true, scraper: 'infosys' },
    { name: 'TCS', careerUrl: 'https://www.tcs.com/careers', apiEndpoint: null, priority: 3, visaFriendly: true, scraper: 'tcs' },
    { name: 'Cognizant', careerUrl: 'https://www.cognizant.com/careers', apiEndpoint: null, priority: 3, visaFriendly: true, scraper: 'cognizant' },
    { name: 'Wipro', careerUrl: 'https://www.wipro.com/careers', apiEndpoint: null, priority: 3, visaFriendly: true, scraper: 'wipro' },
    { name: 'Capgemini', careerUrl: 'https://www.capgemini.com/us-en/careers', apiEndpoint: null, priority: 3, visaFriendly: true, scraper: 'capgemini' },
    { name: 'HCLTech', careerUrl: 'https://www.hcltech.com/careers', apiEndpoint: null, priority: 3, visaFriendly: true, scraper: 'hcl' },
  ],
};

/**
 * Get all companies as a flat list with ATS type added
 */
export function getAllCompanies() {
  const all = [];
  Object.entries(companies).forEach(([atsType, atsList]) => {
    // Add the ATS type to each company object
    atsList.forEach(company => {
      all.push({ ...company, ats: atsType });
    });
  });
  return all;
}

/**
 * Get companies by priority level
 */
export function getCompaniesByPriority(priority) {
  return getAllCompanies().filter(c => c.priority === priority);
}

/**
 * Get companies by ATS type
 */
export function getCompaniesByATS(atsType) {
  return companies[atsType] || [];
}

/**
 * Get visa-friendly companies only
 */
export function getVisaFriendlyCompanies() {
  return getAllCompanies().filter(c => c.visaFriendly === true);
}
