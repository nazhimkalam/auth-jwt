import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import styled from "styled-components";

type User = {
  id: string;
  name: string;
  email: string;
};

const Home = () => {
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const notify = (message: string) => toast(message);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8080/users", { headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` }, })
      .then((response) => {
        setRegisteredUsers(response.data);
      })
      .catch((error) => {
        notify(error.message);
      });
  }, []);

  const onHandleLogout = async () => {
    await axios
      .delete("http://localhost:8080/logout")
      .then((res) => {
        notify(res.data.message);
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");

        setTimeout(() => {
          navigate("/login");
        }, 500);
      })
      .catch((err) => {
        notify(err);
      });
  };

  return (
    <Container>
      <section>
        <h1>Welcome to the Homepage</h1>
        <button onClick={onHandleLogout}>logout</button>
      </section>
      <main>
        <h4>Here are the list of registered users</h4>
        {registeredUsers.map((user) => (
          <div key={user.id}>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
          </div>
        ))}
      </main>
      <ToastContainer theme="dark" hideProgressBar={true} />
    </Container>
  );
};

export default Home;

const Container = styled.div`
  margin: 2pc;

  > section {
    display: flex;
    align-items: center;
    justify-content: space-between;

    > button {
      background-color: whitesmoke;
      border: 1px solid black;
      padding: 10px;
      border-radius: 5px;
    }
  }

  > main {
    margin: 2pc 0;
    > div {
      color: grey;
      margin: 0.5pc 0;
    }
  }
`;
