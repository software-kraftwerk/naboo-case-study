import { ActivityFragment } from "@/graphql/generated/types";
import { useFavoriteActivities } from "@/hooks";
import { useGlobalStyles } from "@/utils";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Flex,
  Grid,
  Group,
  Image,
  Text,
} from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import Link from "next/link";

interface ActivityProps {
  activity: ActivityFragment;
}

export function Activity({ activity }: ActivityProps) {
  const { classes } = useGlobalStyles();
  const { isFavorite, toggle, isAuthenticated } = useFavoriteActivities();
  const activityIsFavorite = isFavorite(activity.id);

  return (
    <Grid.Col span={4}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Image
            src="https://dummyimage.com/480x4:3"
            height={160}
            alt="random image of city"
          />
        </Card.Section>

        <Group position="apart" mt="md" mb="xs">
          <Text weight={500} className={classes.ellipsis}>
            {activity.name}
          </Text>
        </Group>

        <Group mt="md" mb="xs">
          <Badge color="pink" variant="light">
            {activity.city}
          </Badge>
          <Badge color="yellow" variant="light">
            {`${activity.price}€/j`}
          </Badge>
        </Group>

        <Text size="sm" color="dimmed" className={classes.ellipsis}>
          {activity.description}
        </Text>

        <Flex mt="md" align="center" gap="xs">
          <Link
            href={`/activities/${activity.id}`}
            className={classes.link}
            style={{ flex: 1 }}
          >
            <Button variant="light" color="blue" fullWidth radius="md">
              Voir plus
            </Button>
          </Link>
          {isAuthenticated && (
            <ActionIcon
              onClick={() => toggle(activity.id)}
              color="red"
              variant="subtle"
              size="sm"
            >
              {activityIsFavorite ? (
                <IconHeartFilled size="1rem" />
              ) : (
                <IconHeart size="1rem" />
              )}
            </ActionIcon>
          )}
        </Flex>
      </Card>
    </Grid.Col>
  );
}
