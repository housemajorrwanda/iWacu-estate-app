export interface agent {
  name: string;
  status: string;
  id: string; // ID number
  upi: string; // UPI code
  phone: string;
  otherphone: string;
  description: string;
  photo?: { uri: string; type: string; name: string }; // optional profile photo
};
type HouseDataType = {
  category: string;
  address: string;
  additionalImages: { uri: string; type: string; name: string }[];
  thumbnail: { uri: string; type: string; name: string };
  latitude: number;
  longitude: number;
  additionalFeatures: Record<
    string,
    {
      number?: string;
      image?: {
        uri: string;
        type: string;
        name: string;
      };
    }
  >;

  // ✅ ADD THIS BACK
  customFeatures: {
    id: string;
    name: string;
    number?: string;
    image?: {
      uri: string;
      type: string;
      name: string;
    };
  }[];

  proximity: string[];
  purpose: string;
  price: string;
  agent: agent;
};
export const prepareFormData = (houseData: HouseDataType) => {
  const formData = new FormData();
  console.log("Preparing form data with houseData:", houseData);
  /* ------------------ FILE HELPER ------------------ */
  const getFileName = (file: { uri: string; name?: string }) => {
    if (!file?.uri) return "upload.jpg";

    const uriParts = file.uri.split("/");
    const originalName = file.name || uriParts[uriParts.length - 1];

    if (originalName.includes(".")) return originalName;
    return originalName + ".jpg";
  };

  /* ------------------ BASIC HOUSE ------------------ */
  formData.append("house_category", houseData.category);
  formData.append("latitude", String(houseData.latitude));
  formData.append("longitude", String(houseData.longitude));
  formData.append("address", houseData.address);
  formData.append("payment_category", houseData.purpose);
  formData.append("price", houseData.price);
  formData.append("national_id", houseData.agent.id);
  // formData.append("address", houseData.address || "No address");
  formData.append("description", houseData.agent.description || "No description");

  /* ------------------ THUMBNAIL ------------------ */
  if (houseData.thumbnail?.uri) {
    formData.append("thumbnail", {
      uri: houseData.thumbnail.uri,
      name: getFileName(houseData.thumbnail),
      type: houseData.thumbnail.type || "image/jpeg",
    } as any);
  }

  /* ------------------ AGENT ------------------ */
  formData.append("agent[name]", houseData.agent.name);
  formData.append("agent[status]", houseData.agent.status);
  formData.append("agent[upi]", houseData.agent.upi);
  formData.append("agent[phone]", houseData.agent.phone);
  formData.append("agent[other_phone]", houseData.agent.otherphone);
  formData.append("agent[description]", houseData.agent.description);
  if (Array.isArray(houseData.additionalImages) && houseData.additionalImages.length > 0) {
    houseData.additionalImages.forEach((img, index) => {
      formData.append("additionalImage[]", {
        uri: img.uri,
        name: img.name,
        type: img.type,
      } as any); // 'as any' needed for React Native FormData
    });
  }

  if (houseData.agent.photo?.uri) {
    formData.append("agent[photo]", {
      uri: houseData.agent.photo.uri,
      name: getFileName(houseData.agent.photo),
      type: houseData.agent.photo.type || "image/jpeg",
    } as any);
  }


  /* ------------------ FEATURES (PREDEFINED + CUSTOM) ------------------ */

let index = 0;

/* ---------- PREDEFINED FEATURES ---------- */
if (
  houseData.additionalFeatures &&
  Object.keys(houseData.additionalFeatures).length > 0
) {
  Object.entries(houseData.additionalFeatures).forEach(
    ([featureId, feature]) => {
      if (!feature?.number && !feature?.image?.uri) return;

      formData.append(
        `feature_assignments[${index}][feature]`,
        featureId
      );

      if (feature.number) {
        formData.append(
          `feature_assignments[${index}][available_number]`,
          feature.number
        );
      }

      if (feature.image?.uri) {
        formData.append(
          `feature_assignments[${index}][images][0][image]`,
          {
            uri: feature.image.uri,
            name: feature.image.name || `feature_${index}.jpg`,
            type: feature.image.type || "image/jpeg",
          } as any
        );
      }

      index++;
    }
  );
}

/* ---------- CUSTOM FEATURES ---------- */
if (houseData.customFeatures && houseData.customFeatures.length > 0) {
  houseData.customFeatures.forEach((feature) => {
    if (!feature.name) return;

    formData.append(
      `feature_assignments[${index}][custom_feature_name]`,
      feature.name
    );

    if (feature.number) {
      formData.append(
        `feature_assignments[${index}][available_number]`,
        feature.number
      );
    }

    if (feature.image?.uri) {
      formData.append(
        `feature_assignments[${index}][images][0][image]`,
        {
          uri: feature.image.uri,
          name: feature.image.name || `custom_${index}.jpg`,
          type: feature.image.type || "image/jpeg",
        } as any
      );
    }

    index++;
  });
}

  /* ------------------ PROXIMITY ------------------ */
  houseData.proximity.forEach((id, i) =>
    formData.append(`proximity[${i}]`, id)
  );

  return formData;
};


