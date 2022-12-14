function parseTOPParams(url) {
  const paramsRaw = url.search.split(";");
  let userId = null;
  let eventName = null;
  let eventParams = null;
  for (const paramRaw of paramsRaw) {
    const [key, value] = paramRaw.split("=");
    if (key === "userid") userId = value;
    try {
      if (key === "params") {
        eventParams = JSON.parse(decodeURIComponent(value));
      }
      if (eventParams["customUserId"]) userId = eventParams["customUserId"];
      if (eventParams["eventName"]) {
        eventName = eventParams["eventName"];
      } else {
        eventName = paramsRaw[paramsRaw.length - 1].split("/")[1];
      }
      // unnest params for VKMA
      if (eventParams["eventParams"]) eventParams = eventParams["eventParams"];
    } catch (err) {
      // probably a pixel call, just decode string
      eventParams = decodeURIComponent(value);
    }
  }
  return { userId, eventName, eventParams };
}

function requestCallback(details) {
  const url = new URL(details.url);
  const params = parseTOPParams(url);

  if (!params.eventName) console.warn(`Could not parse ${url}`);
  else
    console.info(
      "→ Sent",
      `"${params.eventName}"`,
      "for",
      `"${params.userId || "unonymous"}"`,
      "with",
      params.eventParams ? params.eventParams : "no params"
    );
}

chrome.webRequest.onBeforeRequest.addListener(requestCallback, {
  urls: ["*://top-fwz1.mail.ru/*"],
});
