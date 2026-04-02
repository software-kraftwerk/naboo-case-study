import { ActivityFragment } from "@/graphql/generated/types";
import { useFavoriteActivities } from "@/hooks";
import { useAuth } from "@/hooks";
import { useGlobalStyles } from "@/utils";
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  Image,
  Text,
} from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import Link from "next/link";

interface ActivityListItemProps {
  activity: ActivityFragment;
}

export function ActivityListItem({ activity }: ActivityListItemProps) {
  const { classes } = useGlobalStyles();
  const { isFavorite, toggle } = useFavoriteActivities();
  const { isAuthenticated } = useAuth();
  const activityIsFavorite = isFavorite(activity.id);

  return (
    <Flex align="center" justify="space-between">
      <Flex gap="md" align="center">
        <Image
          src="https://dummyimage.com/125"
          radius="md"
          alt="random image of city"
          height="125"
          width="125"
        />
        <Box sx={{ maxWidth: "300px" }}>
          <Text className={classes.ellipsis}>{activity.city}</Text>
          <Text className={classes.ellipsis}>{activity.name}</Text>
          <Text className={classes.ellipsis}>{activity.description}</Text>
          <Text
            weight="bold"
            className={classes.ellipsis}
          >{`${activity.price}€/j`}</Text>
        </Box>
      </Flex>
      <Group>
        <Link href={`/activities/${activity.id}`} className={classes.link}>
          <Button variant="outline" color="dark">
            Voir plus
          </Button>
        </Link>
        {isAuthenticated && (
          <ActionIcon
            onClick={() => toggle(activity.id)}
            color="red"
            variant="subtle"
            size="lg"
          >
            {activityIsFavorite ? (
              <IconHeartFilled size="1.2rem" />
            ) : (
              <IconHeart size="1.2rem" />
            )}
          </ActionIcon>
        )}
      </Group>
    </Flex>
  );
}
