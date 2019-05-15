/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.davinci;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.util.StringUtils;

@RunWith(SpringRunner.class)
@SpringBootTest
public class DavinciServerApplicationTests {

    @Test
    public void contextLoads() {
    }

    public static void main(String[] args) {
        String username1 = "zhangsan@creditease.cn";
        String username2 = "lisi@CREDITEASE.cn";
        String domainName = "@creditease.cn";

        System.out.println(username1.replaceAll("(?i)" + domainName, ""));
        System.out.println(username2.replaceAll("(?i)" + domainName, ""));

    }
}
