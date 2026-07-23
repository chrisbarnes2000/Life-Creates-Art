'use server';

import {
  weatherResilientShedDesignAssistant,
  WeatherResilientShedDesignAssistantInput,
  WeatherResilientShedDesignAssistantOutput,
} from '@/ai/flows/weather-resilient-shed-design-assistant';

import { auth as adminAuth } from '@/lib/firebase-admin';

export async function syncAdminClaims(uid: string, email: string) {
  const allowedAdmins = ['chris.barnes.2000@me.com'];
  if (allowedAdmins.includes(email.toLowerCase())) {
    try {
      await adminAuth.setCustomUserClaims(uid, { admin: true });
      return { success: true };
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      if (errMsg.includes('identitytoolkit.googleapis.com') || errMsg.includes('SERVICE_DISABLED') || errMsg.includes('accessNotConfigured')) {
        console.warn('Firebase Custom Claims requires Identity Toolkit API to be enabled in the Google Cloud Console for project 154621295711. Skipping custom claims sync (using fallback role detection instead).');
        return { success: false, error: 'Identity Toolkit API not enabled in GCP Console' };
      }
      console.error('Error setting custom claims:', error);
      return { success: false, error: 'Failed to set admin claims' };
    }
  }
  return { success: false, error: 'User email not in admin allowlist' };
}

export async function extractGooglePhotos(albumUrl: string): Promise<string[]> {
  try {
    console.log('Extracting photos from:', albumUrl);
    const res = await fetch(albumUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 3600 } 
    });

    if (!res.ok) {
      console.warn(`Google Photos album request status is ${res.status} for URL ${albumUrl}. It may be private, expired, or temporarily unreachable.`);
      return [];
    }

    const html = await res.text();
    // Match standard Google Photos image URLs embedded in the page's init data.
    // Enhanced regex to catch more variants of high-res image pointers
    const regex = /\["(https:\/\/[a-z0-9-]+\.googleusercontent\.com\/(?:pw\/)?[a-zA-Z0-9\-_]+)"/g;
    const matches = [...html.matchAll(regex)];
    
    // Deduplicate and filter out short non-image IDs or thumbnails
    const unique = [...new Set(matches.map(m => m[1]))].filter(url => {
        // Exclude common UI icons or small thumbnails if they appear
        if (url.includes('proxy') || url.includes('google-ads')) return false;
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        return id.length > 30; 
    });
    
    console.log(`Extracted ${unique.length} unique photos for ${albumUrl}`);

    // If the URL contains "/photo/", it's a specific photo page. 
    // We should still return the list, but the first one is likely the correct one.
    
    // Append size parameters to get high-res images, and limit to 500 photos for albums
    return unique.map(url => {
      // Check if it already has parameters
      if (url.includes('=')) return url;
      return url + '=w2048-h2048';
    }).slice(0, 500);
  } catch (err) {
    console.error('Failed to extract Google Photos:', err);
    return [];
  }
}

export async function getShedRecommendations(
  input: WeatherResilientShedDesignAssistantInput
): Promise<WeatherResilientShedDesignAssistantOutput> {
  // Transitioning from AI-powered to rule-based local expertise as requested
  try {
    let configuration = "Standard Pacific Northwest configuration: 12-inch roof overhangs, reinforced corner bracing, and 4x4 pressure-treated skids.";
    let materials = "Our signature build: 5/8\" T1-11 exterior siding over CDX plywood structural sheathing. All floors feature CDX plywood for superior moisture resilience.";

    if (input.highRainfall) {
      configuration += " Plus: Grade-A drip edge installation and increased roof pitch for optimal runoff.";
      materials += " Recommended: Zinc strips at the ridge to prevent moss growth and a double-layer felt underlayment.";
    }

    if (input.windExposure) {
      configuration += " Plus: Hurricane strapping on every truss and deep-set ground anchors for high-wind stability.";
    }

    if (input.shade) {
      materials += " Maintenance Tip: We recommend Sherwin-Williams Emerald exterior finish to combat mold and mildew in damp, shaded environments.";
    }

    if (input.location.toLowerCase().includes('coast')) {
      materials += " Coastal environments require hot-dipped galvanized fasteners to prevent salt-air corrosion.";
    } else if (input.location.toLowerCase().includes('cascade')) {
      configuration += " Heavy Snow Load: Engineered rafters spaced at 12\" on-center to handle maximum snow weight.";
    }

    return {
      configurationRecommendations: configuration,
      materialRecommendations: materials,
    };
  } catch (error) {
    console.error('Error calculating local recommendations:', error);
    return {
      configurationRecommendations: "Consult with our building experts for a custom specification.",
      materialRecommendations: "Standard MiniBarnMaster materials: CDX plywood and T1-11 siding.",
    };
  }
}
