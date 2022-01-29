import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';

export default function App() {
  const [passengersArray, setPassengersArray] = useState([]);
  const [total, setTotal] = useState(null);
  const [page, setPage] = useState(null);
  const [currentInfo, setCurrentInfo] = useState(null);
  const [seenPassengers, setSeenPassengers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    axios
      .get(`https://api.instantwebtools.net/v1/passenger?page=${page}&size=20`)
      .then((res) => {
        setPassengersArray([...passengersArray, ...res.data.data]);
        setTotal(res.data.totalPassengers);
      });
  }, [page]);

  const handlePress = (id) => {
    setModalVisible(true);

    if (!seenPassengers.includes(id)) {
      setSeenPassengers([...seenPassengers, id]);
    }

    let info;
    passengersArray.forEach((p) => {
      if (p._id === id) {
        info = p.airline[0];
      }
    });
    setCurrentInfo(info);
  };

  const background = (id) => {
    if (seenPassengers.includes(id)) {
      return { backgroundColor: 'lightgreen' };
    }
  };

  const Passenger = ({ name, trips, id }) => (
    <TouchableOpacity
      style={[styles.row, background(id)]}
      onPress={() => handlePress(id)}
    >
      <Text>{name}</Text>
      <Text>{trips ? trips : 0}</Text>
    </TouchableOpacity>
  );

  const Info = ({ airline }) => {
    const {
      country,
      established,
      head_quaters,
      id,
      logo,
      name,
      slogan,
      website,
    } = airline;
    return (
      <View style={styles.info}>
        <Text style={styles.closeButton} onPress={() => setModalVisible(false)}>
          X
        </Text>
        <Text>Country: {country}</Text>
        <Text>Established: {established}</Text>
        <Text>Headquaters: {head_quaters}</Text>
        <Text>ID: {id}</Text>
        <Text>Name: {name}</Text>
        <Text>Slogan: {slogan}</Text>
        <Text>Website: {website}</Text>
        <Text>Logo:</Text>
        <Image
          source={{ uri: logo }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  };

  const renderPassenger = ({ item }) => (
    <Passenger name={item.name} trips={item.trips} id={item._id} />
  );

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - layoutMeasurement.height / 2
    );
  };

  const handleScrollEnd = (e) => {
    if (isCloseToBottom(e.nativeEvent) && passengersArray.length < total) {
      setPage(page + 1);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={passengersArray}
        renderItem={renderPassenger}
        keyExtractor={(p) => p._id}
        onScroll={handleScrollEnd}
        scrollEventThrottle={1000}
      />
      <Modal
        visible={modalVisible}
        onDismiss={() => setCurrentInfo({})}
        style={styles.modal}
      >
        <Info airline={currentInfo} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    fontSize: 40,
    alignSelf: 'flex-end',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 50,
  },
  info: {
    paddingHorizontal: 15,
    paddingVertical: 45,
  },
  logo: {
    width: 70,
    height: 70,
  },
  modal: {
    flex: 1,
    backgroundColor: 'lightblue',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    height: 30,
    alignItems: 'center',
  },
});
