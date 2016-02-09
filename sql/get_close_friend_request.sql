
SET @searchingRange = 300;
SET @latitude = 48.8553625;
SET @longitude = 2.3515851;
SET @stateSearching = 111;
SET @currentUserId = 5;

SELECT  *
FROM    user
WHERE   MBRContains
                 	(
                        LineString
                        (
                            Point (
                                @latitude + @searchingRange / ( 111.1 / COS(RADIANS(@longitude))),
                                @longitude + @searchingRange / 111.1
                                ),
                            Point (
                                @latitude - @searchingRange / ( 111.1 / COS(RADIANS(@longitude))),
                                @longitude - @searchingRange / 111.1
                                ) 
                            ),
                        geoPoint
                    )
AND user.state = @stateSearching
AND user.id != @currentUserId