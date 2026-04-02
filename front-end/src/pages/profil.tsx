import { FavoriteActivitiesList, PageTitle } from "@/components";
import { withAuth } from "@/hocs";
import { useAuth } from "@/hooks";
import { Avatar, Divider, Flex, Text, Title } from "@mantine/core";
import Head from "next/head";

const Profile = () => {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>Mon profil | CDTR</title>
      </Head>
      <PageTitle title="Mon profil" />
      <Flex align="center" gap="md">
        <Avatar color="cyan" radius="xl" size="lg">
          {user?.firstName[0]}
          {user?.lastName[0]}
        </Avatar>
        <Flex direction="column">
          <Text>{user?.email}</Text>
          <Text>{user?.firstName}</Text>
          <Text>{user?.lastName}</Text>
        </Flex>
      </Flex>
      <Divider my="xl" />
      <Title order={3} mb="md">
        Mes activités favorites
      </Title>
      <FavoriteActivitiesList />
    </>
  );
};

export default withAuth(Profile);
