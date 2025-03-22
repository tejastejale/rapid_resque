import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  ImageBackground,
  Platform,
} from "react-native";
import { Block, Text, theme } from "galio-framework";

import { Button } from "../components";
import { Images, argonTheme } from "../constants";
import { HeaderHeight } from "../constants/utils";
import { useWebSocket } from "./socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE } from "./API/constants";
import userPic from "../assets/imgs/user.png";
import { LinearGradient } from "expo-linear-gradient";
const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 3;

const Profile = () => {
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await AsyncStorage.getItem("token");
        const parse = JSON.parse(res);
        if (parse?.code === 200) setProfileData(parse?.data?.profile);
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, []);

  return (
    <Block flex style={styles.profile}>
      <Block flex>
        <LinearGradient colors={["#e5e7eb", "#FFFFFF"]}>
          <ImageBackground
            blurRadius={5}
            source={Images.ProfileBackground}
            style={styles.profileContainer}
            imageStyle={styles.profileBackground}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ width, marginTop: "25%" }}
            >
              <Block flex style={styles.profileCard}>
                <Block middle style={styles.avatarContainer}>
                  <Image
                    source={
                      profileData?.driver_pic
                        ? { uri: `${BASE}${profileData?.driver_pic}` }
                        : userPic
                    }
                    style={styles.avatar}
                  />
                </Block>
                <Block flex>
                  <Block middle style={styles.nameInfo}>
                    <Text bold size={28} color="#32325D">
                      {profileData?.first_name} {profileData?.last_name}
                    </Text>
                    <Text size={16} color="#32325D" style={{ marginTop: 10 }}>
                      {profileData?.email}
                    </Text>
                    <Text size={16} color="#32325D" style={{ marginTop: 10 }}>
                      {profileData?.phone_number}
                    </Text>
                  </Block>
                  <Block middle style={{ marginTop: 30, marginBottom: 16 }}>
                    <Block style={styles.divider} />
                  </Block>
                  <Block middle>
                    <Text
                      size={16}
                      color="#525F7F"
                      style={{
                        textAlign: "center",
                        marginBottom: 10,
                        marginTop: 8,
                      }}
                    >
                      All these information will be shown to person who's order
                      get accepted by you.
                    </Text>
                  </Block>
                  {/*  <Block row space="between">
                  <Text
                    bold
                    size={16}
                    color="#525F7F"
                    style={{ marginTop: 12 }}
                  >
                    Album
                  </Text>
                  <Button
                    small
                    color="transparent"
                    textStyle={{
                      color: "#5E72E4",
                      fontSize: 12,
                      marginLeft: 24,
                    }}
                  >
                    View all
                  </Button>
                </Block>
                <Block style={{ paddingBottom: -HeaderHeight * 2 }}>
                  <Block row space="between" style={{ flexWrap: "wrap" }}>
                    {Images.Viewed.map((img, imgIndex) => (
                      <Image
                        source={{ uri: img }}
                        key={`viewed-${img}`}
                        resizeMode="cover"
                        style={styles.thumb}
                      />
                    ))}
                  </Block>
                </Block> */}
                </Block>
              </Block>
            </ScrollView>
          </ImageBackground>
        </LinearGradient>
      </Block>
    </Block>
  );
};

const styles = StyleSheet.create({
  profile: {
    marginTop: Platform.OS === "android" ? -HeaderHeight : 0,
    // marginBottom: -HeaderHeight * 2,
    flex: 1,
  },
  profileContainer: {
    width: width,
    height: height,
    padding: 0,
    zIndex: 1,
  },
  profileBackground: {
    width: width,
    height: height / 3,
  },
  profileCard: {
    // position: "relative",
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: 150,
    borderRadius: 6,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2,
    elevation: 2,
  },
  info: {
    paddingHorizontal: 40,
  },
  avatarContainer: {
    position: "relative",
    marginTop: -80,
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 0,
    backgroundColor: "white",
  },
  nameInfo: {
    marginTop: 20,
  },
  divider: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure,
  },
});

export default Profile;
