--
-- PostgreSQL database dump
--

\restrict 6rd1bilf0MXBe8oiwDp4Z32dhXBxv50nslgtkMyGTWwIDddzMgL5EMsizyjyAbI

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_chat_id_fkey;
ALTER TABLE ONLY public.chat_members DROP CONSTRAINT chat_members_chat_id_fkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_pkey;
ALTER TABLE ONLY public.files DROP CONSTRAINT files_pkey;
ALTER TABLE ONLY public.chats DROP CONSTRAINT chats_pkey;
ALTER TABLE ONLY public.chat_members DROP CONSTRAINT chat_members_pkey;
ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.files ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.chats ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.users_id_seq;
DROP TABLE public.users;
DROP SEQUENCE public.messages_id_seq;
DROP TABLE public.messages;
DROP SEQUENCE public.files_id_seq;
DROP TABLE public.files;
DROP SEQUENCE public.chats_id_seq;
DROP TABLE public.chats;
DROP TABLE public.chat_members;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chat_members; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.chat_members (
    user_id integer NOT NULL,
    chat_id integer NOT NULL
);


ALTER TABLE public.chat_members OWNER TO admin;

--
-- Name: chats; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.chats (
    id integer NOT NULL,
    type character varying(10),
    title character varying(100),
    creator_id integer,
    created_at timestamp without time zone
);


ALTER TABLE public.chats OWNER TO admin;

--
-- Name: chats_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.chats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chats_id_seq OWNER TO admin;

--
-- Name: chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.chats_id_seq OWNED BY public.chats.id;


--
-- Name: files; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.files (
    id integer NOT NULL,
    original_name character varying(255) NOT NULL,
    storage_path character varying(255) NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.files OWNER TO admin;

--
-- Name: files_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.files_id_seq OWNER TO admin;

--
-- Name: files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.files_id_seq OWNED BY public.files.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    chat_id integer NOT NULL,
    sender_id integer NOT NULL,
    content text NOT NULL,
    file_id integer,
    is_edited boolean,
    created_at timestamp without time zone
);


ALTER TABLE public.messages OWNER TO admin;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO admin;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    middle_name character varying(100),
    "position" character varying(150),
    avatar_url character varying(255),
    role character varying(20),
    status character varying(20),
    last_seen timestamp without time zone,
    created_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: chats id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.chats ALTER COLUMN id SET DEFAULT nextval('public.chats_id_seq'::regclass);


--
-- Name: files id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.files ALTER COLUMN id SET DEFAULT nextval('public.files_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: chat_members; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.chat_members (user_id, chat_id) FROM stdin;
2	1
3	1
1	2
2	2
3	2
2	3
3	3
\.


--
-- Data for Name: chats; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.chats (id, type, title, creator_id, created_at) FROM stdin;
1	private	\N	\N	2026-05-03 16:07:20.803022
2	group	папа	2	2026-05-03 16:30:49.695847
3	group	Курсовая работа	3	2026-05-07 03:14:53.942235
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.files (id, original_name, storage_path, user_id, created_at) FROM stdin;
1	free-icon-datebook-14663650.png	22b93a0a-ca03-4178-b803-ad48013b4372.png	2	2026-05-03 16:05:58.623715
2	free-icon-datebook-14663650.png	adebdc1d-4726-4751-a7f8-a420f70b591a.png	2	2026-05-03 16:07:28.932054
3	free-icon-datebook-14663650.png	78a57560-823f-4785-92b0-07c29c4cb15c.png	2	2026-05-03 16:11:00.179706
4	Goidagram favicon design.png	a336e552-9911-4a5c-bae7-f33b4b3e7b9c.png	2	2026-05-07 02:38:21.623644
5	Лаб_3 (1).pdf	482dc53f-9c17-4acb-9d2f-38dacb830c77.pdf	3	2026-05-07 02:48:49.54959
6	Dota 2.url	db20037d-db4d-4599-b214-a65d60016a64.url	3	2026-05-07 02:51:47.882848
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.messages (id, chat_id, sender_id, content, file_id, is_edited, created_at) FROM stdin;
1	1	2	Привет	\N	f	2026-05-03 16:07:24.348163
2	1	3	Привет	\N	f	2026-05-03 16:14:55.999266
4	1	3	Привет	\N	f	2026-05-03 16:27:39.379711
5	1	3	привет	\N	f	2026-05-03 16:28:57.394319
6	1	3	Привет	\N	f	2026-05-03 16:29:04.352534
7	1	3	ку	\N	f	2026-05-03 16:29:14.666544
8	1	3	ап	\N	f	2026-05-03 16:29:16.376553
9	1	3	ку	\N	f	2026-05-03 16:29:24.678146
10	1	3	как дела	\N	f	2026-05-03 16:29:33.337168
11	2	3	как	\N	f	2026-05-03 16:31:29.667594
12	2	3	как	\N	f	2026-05-03 16:31:33.773447
13	1	3	ку	\N	f	2026-05-03 16:36:46.69995
14	1	3	паап	\N	f	2026-05-03 16:36:48.329965
15	1	3	апапап	\N	f	2026-05-03 16:36:49.028778
16	2	2	папав	\N	f	2026-05-03 16:36:58.416889
17	2	2	паапв	\N	f	2026-05-03 16:36:59.924654
18	2	2	павпав	\N	f	2026-05-03 16:37:00.607074
19	2	2	ррпаарп	\N	f	2026-05-03 16:37:01.286459
20	2	2	паавп	\N	f	2026-05-03 16:37:27.737289
21	1	2	апвапв	\N	f	2026-05-03 16:37:32.412929
22	1	2	fg	\N	f	2026-05-05 10:45:41.395261
23	1	2	re	\N	f	2026-05-05 10:45:46.599641
24	1	2	ку	\N	f	2026-05-05 10:45:48.077736
25	1	2	gfgf	\N	f	2026-05-06 08:01:58.720119
26	2	2	fdfd	\N	f	2026-05-06 08:02:03.102992
27	1	2	пока	\N	f	2026-05-07 02:39:54.824706
29	1	3	📎 Файл: Лаб_3 (1).pdf	5	f	2026-05-07 02:48:49.575735
28	1	3	Здравствуйте	\N	t	2026-05-07 02:44:20.458541
31	1	3	Привет	\N	f	2026-05-07 03:20:54.872877
32	1	3	Привет	\N	f	2026-05-07 03:21:03.363103
33	1	3	Ghbdtn	\N	f	2026-05-07 03:21:32.77788
34	1	3	Ghbdtn	\N	f	2026-05-07 03:21:48.597057
35	1	3	Привет	\N	f	2026-05-07 03:21:56.037607
36	1	2	TEST_METRIC_MESSAGE	\N	f	2026-05-07 04:57:30.452848
37	1	2	TEST_METRIC_MESSAGE	\N	f	2026-05-07 04:58:31.717934
38	1	2	TEST_METRIC_MESSAGE	\N	f	2026-05-07 04:58:54.309497
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, email, password_hash, first_name, last_name, middle_name, "position", avatar_url, role, status, last_seen, created_at) FROM stdin;
1	admin@goida.ru	$2b$12$f81gXBR6CRwcaqx4nVTmTu5akCkWcQq9ujxOuupAO95ZGFURXrrDm	Системный	Администратор	\N	IT-Департамент	\N	Admin	online	2026-05-03 16:04:19.470258	2026-05-03 16:04:19.47027
3	ian@goida.ru	$2b$12$Dh3.x/f6smWkgFDlEaoT8.olpGUthuSv5Xvp19e8Kkp0zx.I1y/Gi	Ян	Дашевский	Александрович	Разработчик	\N	User	offline	2026-05-07 04:58:54.327579	2026-05-03 16:05:43.122594
2	dima@goida.ru	$2b$12$gjqDQ6V0qK2Fn3sgzvfaW.A0WKMXjJjihucj0Jfg8.7VX0rm4J7M6	Иван	Иванов	Иванович	Тестировщик	/api/files/download/4	User	online	2026-05-07 05:10:42.838829	2026-05-03 16:05:16.379424
\.


--
-- Name: chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.chats_id_seq', 3, true);


--
-- Name: files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.files_id_seq', 6, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.messages_id_seq', 38, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: chat_members chat_members_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.chat_members
    ADD CONSTRAINT chat_members_pkey PRIMARY KEY (user_id, chat_id);


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: chat_members chat_members_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.chat_members
    ADD CONSTRAINT chat_members_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id);


--
-- Name: messages messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 6rd1bilf0MXBe8oiwDp4Z32dhXBxv50nslgtkMyGTWwIDddzMgL5EMsizyjyAbI

