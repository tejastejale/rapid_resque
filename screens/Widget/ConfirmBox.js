import Dialog from "react-native-dialog";
import { View, TouchableOpacity, Text } from "react-native";
import { useState } from "react";

const ConfirmBox = ({ id, handleAccept }) => {
  const [visible, setVisible] = useState(false);

  const showDialog = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleConfirm = () => {
    handleAccept(id);
    setVisible(false);
  };

  return (
    <View>
      <TouchableOpacity onPress={showDialog}>
        <Text>Accept Request</Text>
      </TouchableOpacity>
      <Dialog.Container visible={visible}>
        <Dialog.Title>Confirm Acceptance</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to accept this request?
        </Dialog.Description>
        <Dialog.Button label="Cancel" onPress={handleCancel} />
        <Dialog.Button label="Accept" onPress={handleConfirm} />
      </Dialog.Container>
    </View>
  );
};

export default ConfirmBox;
