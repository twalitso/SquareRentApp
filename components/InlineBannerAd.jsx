import { View } from 'react-native';
import * as Device from 'expo-device';
import React, { useState } from 'react';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const androidAdmobBanner = "ca-app-pub-6203298272391383/6608047080";
const iosAdmobBanner = "";
const productionID = Device.osName === 'Android' ? androidAdmobBanner : iosAdmobBanner;

const InlineAd = () => {
  const [isAdLoaded, setIsAdLoaded] = useState<boolean>(false);
  return (
    <View style={{ height: isAdLoaded ? 'auto' : 0 }}>
      <BannerAd
        // use test IDs in development as you can be banned/restricted by Google AdMob for inappropriately using real ad banners during testing
        unitId={__DEV__ ? TestIds.BANNER : productionID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true, 
        }}
        onAdLoaded={() => {
          setIsAdLoaded(true);
        }}
      />
    </View >
  );
};

export default InlineAd;