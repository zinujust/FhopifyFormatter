export function createShopifyCSV(filteredData, images, hierarchy, map) {
  
  try {
    let csvHeader =
      "Handle,Title,Body (HTML),Vendor,Product Category,Type,Tags,Published,Option1 Name,Option1 Value," +
      "Option1 Linked To,Option2 Name,Option2 Value,Option2 Linked To,Option3 Name,Option3 Value,Option3 Linked To,Variant SKU," +
      "Variant Grams,Variant Inventory Tracker,Variant Inventory Qty,Variant Inventory Policy,Variant Fulfillment Service," +
      "Variant Price,Variant Compare At Price,Variant Requires Shipping,Variant Taxable,Variant Barcode,Image Src,Image Position," +
      "Image Alt Text,Gift Card,SEO Title,SEO Description,Google Shopping / Google Product Category,Google Shopping / Gender," +
      "Google Shopping / Age Group,Google Shopping / MPN,Google Shopping / Condition,Google Shopping / Custom Product," +
      "Google Shopping / Custom Label 0,Google Shopping / Custom Label 1,Google Shopping / Custom Label 2,Google Shopping / Custom Label 3," +
      "Google Shopping / Custom Label 4,Product rating count (product.metafields.reviews.rating_count)," +
      "Complementary products (product.metafields.shopify--discovery--product_recommendation.complementary_products)," +
      "Related products (product.metafields.shopify--discovery--product_recommendation.related_products)," +
      "Related products settings (product.metafields.shopify--discovery--product_recommendation.related_products_display)," +
      "Variant Image,Variant Weight Unit,Variant Tax Code,Cost per item,Included / United States,Price / United States," +
      "Compare At Price / United States,Included / Added by Managed Markets,Price / Added by Managed Markets," +
      "Compare At Price / Added by Managed Markets,Status\r\n";

    Object.keys(filteredData).forEach((key) => {
      const item = filteredData[key];
      let handle = createHandle(
        item["Brand Long Name"],
        item["Description 125 Character"],
        item["Item Number"]
      );
      let title = `"${createTitle(
        item["Brand Long Name"],
        item["Description 125 Character"]
      )}"`;
      let bodyHtml = createBodyHtml(item);
      let vendor = item["Brand Long Name"].replace(/[,]/g, "");
      let productCategory = "";
      let type = `"${fetchHierarchy(hierarchy, item["Item Number"])}"`;
      let tags = `"${fetchTags(item["Keywords"])}"`;
      let published = "TRUE";
      let option1Name = "Title";
      let option1Value = "Default Title";
      let Option1LinkedTo = "";
      let option2Name = "";
      let option2Value = "";
      let Option2LinkedTo = "";
      let option3Name = "";
      let option3Value = "";
      let Option3LinkedTo = "";
      let variantSku = item["Item Number"];
      let variantGramCalc = item["Item Weight"] * 453.592;
      let variantGram = variantGramCalc.toFixed(2);
      let variantInventoryTracker = "shopify";
      let variantInventoryQty = "0";
      let variantInventoryPolicy = "deny";
      let variantFulfillmentService = "manual";
      let variantPrice = setPriceWithMarkupOrMap(item, map);
      let variantCompareAtPrice = item["List Price"];
      let variantRequiresShipping = "TRUE";
      let variantTaxable = "TRUE";
      let variantBarcode = item["UPC Item GTIN"];
      let imageSrc = images[item["Item Number"]]["1"];
      let imagePosition = 1;
      let imageAltText = "";
      let giftCard = "FALSE";
      let seoTitle = "";
      let seoDescription = "";
      let gsProductCategory = "";
      let gsGender = "";
      let gsAgeGroup = "";
      let gsMpn = "";
      let gsCondition = "";
      let gsCustomProduct = "";
      let gsCustomLabel0 = "";
      let gsCustomLabel1 = "";
      let gsCustomLabel2 = "";
      let gsCustomLabel3 = "";
      let gsCustomLabel4 = "";
      let productRatingCount = "";
      let complementaryProducts = "";
      let relatedProducts = "";
      let relatedProductsSettings = "";
      let variantImage = "";
      let variantWeightUnit = "lb";
      let variantTaxCode = "";
      let costPerItem = Number.parseFloat(item["Cost Column 1 Price"]).toFixed(
        2
      );
      let includedUS = "TRUE";
      let priceUS = "";
      let compareAtPriceUS = "";
      let includedAddedByManagedMarkets = "TRUE";
      let priceAddedByManagedMarkets = "";
      let compareAtPriceAddedByManagedMarkets = "";
      let status = "draft";

      csvHeader += `${handle},${title},${bodyHtml},${vendor},${productCategory},${type},${tags},${published},${option1Name},${option1Value},${Option1LinkedTo},${option2Name},${option2Value},${Option2LinkedTo},${option3Name},${option3Value},${Option3LinkedTo},${variantSku},${variantGram},${variantInventoryTracker},${variantInventoryQty},${variantInventoryPolicy},${variantFulfillmentService},${variantPrice},${variantCompareAtPrice},${variantRequiresShipping},${variantTaxable},${variantBarcode},${imageSrc},${imagePosition},${imageAltText},${giftCard},${seoTitle},${seoDescription},${gsProductCategory},${gsGender},${gsAgeGroup},${gsMpn},${gsCondition},${gsCustomProduct},${gsCustomLabel0},${gsCustomLabel1},${gsCustomLabel2},${gsCustomLabel3},${gsCustomLabel4},${productRatingCount},${complementaryProducts},${relatedProducts},${relatedProductsSettings},${variantImage},${variantWeightUnit},${variantTaxCode},${costPerItem},${includedUS},${priceUS},${compareAtPriceUS},${includedAddedByManagedMarkets},${priceAddedByManagedMarkets},${compareAtPriceAddedByManagedMarkets},${status}`;
      csvHeader += "\r\n";

      const imageKeys = Object.keys(images[item['Item Number']]);
      for (let i = 1; i < imageKeys.length; i++) {
        csvHeader += `${handle},,,,,,,,,,,,,,,,,,,,,,,,,,,,${images[item['Item Number']][imageKeys[i]]},${i+1},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`;
        csvHeader += "\r\n";
      }

    });

    return csvHeader;
  } catch (error) {
    throw new Error(`Error creating Shopify CSV: ${error.message}`);
  }
}

function createHandle(manufacturerName, description, itemNumber) {
  try {
    let handle = manufacturerName + "-" + description + "-" + itemNumber;
    handle = handle.replace(/[-®™©,+\.\/_\s()":;']/g, "-").toLowerCase();
    handle = handle.replace(/-+/g, "-");
    handle = handle.replace(/^-|-$/g, "");
    return handle;
  } catch (error) {
    throw new Error(`Error creating handle: ${error.message}`);
  }
}

function createBodyHtml(item) {
  try {
    let sellingCopyShort = item["Selling Copy Short"];
    sellingCopyShort = sellingCopyShort.replace(/["]/g, '""');

    let sellingPoints = [];

    for (let i = 1; i < 11; i++) {
      if (item[`Selling Point #${i}`]) {
        let sp = item[`Selling Point #${i}`];
        sp = sp.replace(/["]/g, '""');
        sellingPoints.push(sp);
      }
    }

    let bodyHtml = `"<ul>${sellingPoints.map(
      (point) => `<li>${point}</li>`
    ).join("")}</ul><p>${sellingCopyShort}</p>"`;

    return bodyHtml;
  } catch (error) {
    throw new Error(`Error creating body HTML: ${error.message}`);
  }
}

function setPriceWithMarkupOrMap(item, map) {
  try {
    let cost = parseFloat(item["Cost Column 1 Price"]);
    let weight = parseFloat(item["Item Weight"]);

    const priceWithMarkup = weight <= 25 ? (cost + (cost * 0.30)) : (cost + (cost * 0.35));
    let mapFound = null;
    
    for (let [key, value] of Object.entries(map)) {
      if (Object.values(value).includes(item["Item Number"])) {
        console.log("MAP FOUND: ", value);
        
        mapFound = value;
        break;
      }
    }
    

    return priceWithMarkup < 0.10 ? parseFloat(item["List Price"]).toFixed(2) :
    priceWithMarkup > (mapFound ? mapFound[" JAN 2025 MAP "] : 0) ? priceWithMarkup.toFixed(2) : parseFloat(mapFound[" JAN 2025 MAP "]).toFixed(2);
  } catch (error) {
    throw new Error(`Error setting price with markup: ${error.message}`);
  }
}

function createTitle(brandName, description) {
  try {
    let title = brandName + " " + description;
    title = title.replace(/["]/g, '""');
    return title;
  } catch (error) {
    throw new Error(`Error creating title: ${error.message}`);
  }
}

function fetchHierarchy(hierarchy, itemNumber) {
  try {
    let data = "";
    for (let value of Object.values(hierarchy)) {
      if (value['Item Number'] === itemNumber) {
        data = value['Hierarchy Level 3'];
        data = data.replace(/["]/g, '""');
        break;
      }
    }
    return data;

  } catch (error) {
    throw new Error(`Error fetching hierarchy: ${error.message}`);
  }
}

function fetchTags(tags) {
  //`"${item["Keywords"].replace(/["]/g, '""').replace(/[-]/g, '"-"').replace(/[\/]/g, '" "').split("; ").join(", ")}"`;

  try {
    let data = tags
      .replace(/["]/g, '""')
      .split("; ")
      .join(", ");
    return data;  
  } catch (error) {
    throw new Error(`Error fetching tags: ${error.message}`);
  }
}