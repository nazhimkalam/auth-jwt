import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import styled from 'styled-components';
import 'react-toastify/dist/ReactToastify.css';

type FormData = {
    name?: string
    email?: string
    password?: string
}

const Register = () => {
    const [form, setForm] = useState<FormData>();
    const notify = (message: string) => toast(message);
    const navigate = useNavigate();

    const onChangeEmail = (value: string) => {
        setForm({ ...form, email: value })
    }

    const onChangePassword = (value: string) => {
        setForm({ ...form, password: value })
    }

    const onChangeName = (value: string) => {
        setForm({ ...form, name: value })
    }

    const onHandleRegister = (e: any) => {
        e.preventDefault();
        axios.post('http://localhost:8080/register', form).then(res => {
            notify(res.data.message)
            setTimeout(() => {
                navigate('/login')
            }, 500);
        }).catch(err => {
            notify(err);
        })
    }

    return (
        <Container>
            <h2>Register</h2>
            <form onSubmit={onHandleRegister}>
                <input type="text" name="name" placeholder="Name" onChange={e => onChangeName(e.target.value)} required/> <br />
                <input type="text" name="email" placeholder="Email" onChange={e => onChangeEmail(e.target.value)} required/> <br />
                <input type="password" name="password" placeholder="Password" onChange={e => onChangePassword(e.target.value)} required/> <br />
                <button type="submit">Submit</button> <br />
                <Link to="/">Go to login</Link>
            </form>
            <ToastContainer theme="dark" hideProgressBar={true} />
        </Container>
    )
}

export default Register

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;

    h2 {
        margin-bottom: 20px;
        text-transform: uppercase;
        color: grey;
    }

    form {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 300px;
        height: 300px;
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 20px;

        > button {
            width: 100%;
            height: 30px;
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 5px;
            margin-bottom: 10px;
            cursor: pointer;
        }

        > input {
            width: 100%;
            height: 30px;
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 5px;
            margin-bottom: 10px;
        }

        > a {
            color: grey;
            text-decoration: none;
        }
    }

`;